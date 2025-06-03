import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient();

// GET /api/writings - Fetch all writings
export async function GET() {
  try {
    const writings = await prisma.writing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(writings);
  } catch (error) {
    console.error('Error fetching writings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Clean up database connection
  }
}

// POST /api/writings - Create new writing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const writing = await prisma.writing.create({
      data: body
    });

    return NextResponse.json(writing, { status: 201 });
  } catch (error) {
    console.error('Error creating writing:', error);
    return NextResponse.json(
      { error: 'Failed to create writing' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}