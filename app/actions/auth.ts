'use server';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/schema';
import { lucia, validateRequest } from '@/lib/auth';
import { signInSchema, signUpSchema } from '@/lib/schema';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  console.log(values);
  const hashedPassword = await argon2.hash(values.password);
  const userId = generateId(15);

  try {
    await db
      .insert(userTable)
      .values({
        id: userId,
        username: values.username,
        hashedPassword,
      })
      .returning({
        id: userTable.id,
        username: userTable.username,
      });

    const session = await lucia.createSession(userId, {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
    });

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return {
      success: true,
      data: {
        userId,
      },
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const signIn = async (values: z.infer<typeof signInSchema>) => {
  console.log(values);

  const existingUser = await db.query.userTable.findFirst({
    where: (table) => eq(table.username, values.username),
  });

  if (!existingUser) {
    return {
      error: 'Invalid credentials provided.',
    };
  }

  const isValidPassword = await argon2.verify(
    existingUser.hashedPassword,
    values.password
  );

  if (!isValidPassword) {
    return {
      error: 'Invalid credentials provided.',
    };
  }

  const session = await lucia.createSession(existingUser.id, {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  });

  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return {
    success: 'Logged in successfully.',
  };
};

export const signOut = async () => {
  try {
    const { session } = await validateRequest();

    if (!session) {
      return {
        error: 'Unauthorized',
      };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
