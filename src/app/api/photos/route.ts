// app/api/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all photos
export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend interface
    const transformedPhotos = photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      date: photo.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      filename: photo.filename,
      path: photo.path
    }));

    return NextResponse.json(transformedPhotos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST - Create new photos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Expect an array of photos or a single photo object
    const photoData = Array.isArray(body.photos) ? body.photos : [body];
    
    // Validate required fields
    for (const photo of photoData) {
      if (!photo.url) {
        return NextResponse.json(
          { error: 'URL is required for each photo' },
          { status: 400 }
        );
      }
    }

    // Define the photo input type
    interface PhotoInput {
      url: string;
      title?: string | null;
      filename?: string;
      path?: string;
    }
    
    // Create all photos in the database
    const createdPhotos = await Promise.all(
      photoData.map(async (photo: PhotoInput) => {
        // Generate filename if not provided
        const filename = photo.filename || `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
        const path = photo.path || `/uploads/photos/${filename}`;
        
        return await prisma.photo.create({
          data: {
            url: photo.url,
            title: photo.title || null,
            filename: filename,
            path: path
          }
        });
      })
    );

    // Transform the response to match the frontend interface
    const transformedPhotos = createdPhotos.map(photo => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      date: photo.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      filename: photo.filename,
      path: photo.path
    }));

    return NextResponse.json(transformedPhotos, { status: 201 });
  } catch (error) {
    console.error('Error creating photos:', error);
    return NextResponse.json(
      { error: 'Failed to create photos' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const id = await request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required to delete a photo' },
        { status: 400 }
      );
    }

    // Delete the photo from the database
    await prisma.photo.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

// Clean up Prisma connection on module unload
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});