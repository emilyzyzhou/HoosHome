import { NextResponse } from 'next/server';
import dbPool from '@/app/lib/db'; 
import type { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { homeName, homeAddress } = body;

    // validation
    if (!homeName || !homeAddress) {
      return NextResponse.json(
        { success: false, message: "Home name and address are required." },
        { status: 400 }
      );
    }

    // random number generator
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    // inserting into database
    const [result] = await dbPool.query(
      'INSERT INTO Homes (name, address, join_code) VALUES (?, ?, ?)',
      [homeName, homeAddress, joinCode]
    );
    
    const insertResult = result as ResultSetHeader;

    if (insertResult.affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: "New home created successfully!",
        newHome: {
          home_id: insertResult.insertId,
          name: homeName,
          address: homeAddress,
          joinCode: joinCode,
        }
      });
    } else {
      throw new Error("No rows were affected. Insert failed.");
    }

  } catch (error: any) {
    console.error("API /api/create-home error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: "A duplicate join code was generated. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}