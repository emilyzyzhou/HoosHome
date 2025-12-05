import { NextResponse } from 'next/server';
import {pool} from '../../../../server/src/db/pool.js'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { joinCode } = body;

    if (!joinCode) {
      return NextResponse.json(
        { success: false, message: "Join code is required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      'SELECT * FROM Homes WHERE join_code = ?', 
      [joinCode]
    );

    const homes = rows as any[]; 

    if (homes.length > 0) {
      const home = homes[0];
      console.log("Found home:", home);
      return NextResponse.json({ success: true, home_id: home.id });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid join code." },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}