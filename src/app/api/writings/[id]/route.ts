// app/api/writings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient();

// GET /api/writings/[id] - Fetch a specific writing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const writing = await prisma.writing.findUnique({
      where: { id },
    });

    if (!writing) {
      return NextResponse.json(
        { error: 'Writing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(writing);
  } catch (error) {
    console.error('Error fetching writing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing' },
      { status: 500 }
    );
  }
}

// PUT /api/writings/[id] - Update a writing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Check if writing exists
    const existingWriting = await prisma.writing.findUnique({
      where: { id },
    });

    if (!existingWriting) {
      return NextResponse.json(
        { error: 'Writing not found' },
        { status: 404 }
      );
    }

    // Update writing
    const updatedWriting = await prisma.writing.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existingWriting.title,
        category: data.category !== undefined ? data.category : existingWriting.category,
        description: data.description !== undefined ? data.description : existingWriting.description,
        image: data.image !== undefined ? data.image : existingWriting.image,
        tags: data.tags !== undefined ? data.tags : existingWriting.tags,
        contentUrl: data.contentUrl !== undefined ? data.contentUrl : existingWriting.contentUrl,
      },
    });

    return NextResponse.json({ 
      message: 'Writing updated successfully', 
      writing: updatedWriting 
    });
  } catch (error) {
    console.error('Error updating writing:', error);
    return NextResponse.json(
      { error: 'Failed to update writing' },
      { status: 500 }
    );
  }
}

// DELETE /api/writings/[id] - Delete a writing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if writing exists
    const existingWriting = await prisma.writing.findUnique({
      where: { id },
    });

    if (!existingWriting) {
      return NextResponse.json(
        { error: 'Writing not found' },
        { status: 404 }
      );
    }

    // Delete writing
    await prisma.writing.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Writing deleted successfully' });
  } catch (error) {
    console.error('Error deleting writing:', error);
    return NextResponse.json(
      { error: 'Failed to delete writing' },
      { status: 500 }
    );
  }
}
