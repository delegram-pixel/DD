// app/api/writings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma'

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
  }
}

// POST /api/writings - Create a new writing
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.category || !data.description || !data.image || !data.contentUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new writing
    const writing = await prisma.writing.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        image: data.image,
        tags: data.tags || [],
        contentUrl: data.contentUrl,
      },
    });
    
    return NextResponse.json({ message: 'Writing created successfully', writing });
  } catch (error) {
    console.error('Error creating writing:', error);
    return NextResponse.json(
      { error: 'Failed to create writing' },
      { status: 500 }
    );
  }
}
