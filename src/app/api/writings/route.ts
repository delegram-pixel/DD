// app/api/writings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    // Log the complete error object for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      // Check for Prisma validation errors
      if ('code' in error) {
        console.error('Prisma error code:', (error as any).code);
      }
    }
    
    const errorResponse = {
      error: 'Failed to create writing',
      details: error instanceof Error ? error.message : 'Unknown error',
      // Include the full error in development for debugging
      ...(process.env.NODE_ENV !== 'production' && { 
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)) 
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
