import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

// Initialize Prisma client directly like other API routes
const prisma = new PrismaClient();

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    console.log('Profile API GET request received:', request.url);
    
    // Try to fetch user profile from the database
    const user = await prisma.user.findFirst();
    
    if (user) {
      console.log('Found user profile in database:', user.id);
      
      // Return actual user data from the database
      return NextResponse.json({
        name: user.name,
        title: user.title || '',
        bio: user.bio || '',
        image: user.image || '',
        email: user.email,
        location: user.location || '',
        website: user.website || '',
        twitterHandle: user.twitterHandle || '',
        instagramHandle: user.instagramHandle || '',
        facebookHandle: user.facebookHandle || '',
        social: {
          twitter: user.twitterHandle || '',
          instagram: user.instagramHandle || '',
          facebook: user.facebookHandle || '',
        },
        education: user.education || '',
        experience: user.experience || '',
        interests: user.interests || '',
        about: {
          education: user.education || '',
          experience: user.experience || '',
          interests: user.interests || '',
        },
        stats: {
          writings: user.writingsCount || 0,
          photos: user.photosCount || 0,
          followers: user.followersCount || 0,
        },
        achievements: {
          awards: [], 
          publications: [],
          recognition: []
        }
      });
    } else {
      console.log('No user profile found in database, returning default data');
      
      // Return a default profile if no user exists yet
      return NextResponse.json({
        name: "Jane Writer",
        title: "Writer & Photographer",
        bio: "Creative writer specializing in fiction and photography with a passion for storytelling through both words and images.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop",
        email: "jane@example.com",
        location: "London, UK",
        website: "https://example.com",
        social: {
          twitter: "@janewriter",
          instagram: "@janewriterphotos",
          facebook: "janewriter",
        },
        about: {
          education: "MFA in Creative Writing from University of Arts",
          experience: "10+ years of writing and photography experience",
          interests: "Travel, Literature, Visual Arts",
        },
        stats: {
          writings: 24,
          photos: 52,
          followers: 250,
        },
        achievements: {
          awards: ["National Book Award Finalist 2023", "Photography Excellence Award 2022"],
          publications: [
            { title: "The Silent Echo", description: "Published in The New Yorker, 2023" },
            { title: "Shifting Perspectives", description: "Photo essay in National Geographic, 2022" }
          ],
          recognition: ["Featured in Writer's Digest", "Photography exhibition at Modern Art Gallery"]
        }
      });
    }
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    console.log('Profile API PUT request received');
    const data = await request.json();
    console.log('Profile update data received:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.email) {
      console.error('Email is required but was not provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Default required values for name if not provided
    const name = data.name || 'User';
    
    // Check if any user exists in the database
    const existingUser = await prisma.user.findFirst();
    
    if (existingUser) {
      console.log('Found existing user:', existingUser.id);
      
      try {
        // Update the existing user
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            email: data.email,
            title: data.title || '',
            bio: data.bio || '',
            image: data.image || '',
            location: data.location || '',
            website: data.website || '',
            twitterHandle: data.social?.twitter || '',
            instagramHandle: data.social?.instagram || '',
            facebookHandle: data.social?.facebook || '',
            education: data.about?.education || '',
            experience: data.about?.experience || '',
            interests: data.about?.interests || '',
            updatedAt: new Date(),
          },
        });
        
        console.log('User updated successfully:', updatedUser.id);
        return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
      } catch (updateError) {
        console.error('Error updating user:', updateError);
        // If update fails, fall through to create
      }
    }
    
    // If no user exists or update failed, create a new one
    console.log('Creating a new user...');
    
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: data.email,
        title: data.title || '',
        bio: data.bio || '',
        image: data.image || '',
        location: data.location || '',
        website: data.website || '',
        twitterHandle: data.social?.twitter || '',
        instagramHandle: data.social?.instagram || '',
        facebookHandle: data.social?.facebook || '',
        education: data.about?.education || '',
        experience: data.about?.experience || '',
        interests: data.about?.interests || '',
        writingsCount: 0,
        photosCount: 0,
        followersCount: 0,
      }
    });
    
    console.log('User created successfully:', newUser.id);
    return NextResponse.json({ message: 'User created successfully', user: newUser });
    
  } catch (error) {
    // Handle specific Prisma errors with more detailed information
    console.error('Database operation failed:', error);
    
    // Try to extract meaningful error message
    let errorMessage = 'Unknown database error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Prisma error patterns
      if (errorMessage.includes('P2002')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      } else if (errorMessage.includes('P2025')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Database operation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
      const data = await request.json();
  
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          title: data.title || '',
          bio: data.bio || '',
          image: data.image || '',
          location: data.location || '',
          website: data.website || '',
          twitterHandle: data.social?.twitter || '',
          instagramHandle: data.social?.instagram || '',
          facebookHandle: data.social?.facebook || '',
          education: data.about?.education || '',
          experience: data.about?.experience || '',
          interests: data.about?.interests || '',
        },
      });
  
      return NextResponse.json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }