"use client";

import Link from "next/link";
import Image from "next/image";
import { FiBook, FiImage, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Define interfaces for writings and photos to match our API structure
interface Writing {
  id?: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  contentUrl?: string;
  content?: string;
}

interface Photo {
  id: string;
  url: string;
  title: string | null;
  date: string | Date;
  filename: string;
  path: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Enhanced API client for fetching data
const apiClient = {
  getWritings: async (): Promise<Writing[]> => {
    try {
      const response = await fetch("/api/writings");
      if (!response.ok) {
        throw new Error(`Failed to fetch writings: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching writings:", error);
      return [];
    }
  },
  
  getPhotos: async (): Promise<Photo[]> => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
    }
  }
};

export default function HomePage() {
  const [featuredWritings, setFeaturedWritings] = useState<Writing[]>([]);
  const [featuredPhotos, setFeaturedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch writings and photos simultaneously
        const [writings, photos] = await Promise.all([
          apiClient.getWritings(),
          apiClient.getPhotos()
        ]);
        
        // Get up to 3 most recent writings for featured display
        const sortedWritings = writings.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }).slice(0, 3);
        
        // Get up to 8 most recent photos for featured display
        const photoUrls = photos
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8)
          .map(photo => photo.url);
        
        setFeaturedWritings(sortedWritings);
        setFeaturedPhotos(photoUrls);
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="container px-4 py-10 md:py-16 space-y-12">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
          Welcome to My Writing Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          I&apos;m a passionate writer who loves to share stories, thoughts, and moments through words and images.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/works">
              <FiBook className="mr-2 h-5 w-5" />
              Explore My Works
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/photos">
              <FiImage className="mr-2 h-5 w-5" />
              Browse Photos
            </Link>
          </Button>
        </div>
      </section>

      <section className="relative h-[500px] w-full rounded-xl overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517336277864-efc71c7a3020?q=80&w=1920&auto=format&fit=crop"
          alt="Writer's desk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex items-end p-8 md:p-12">
          <div className="max-w-3xl text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Writing is my passion</h2>
            <p className="text-lg mb-6">I transform ideas into carefully crafted words that resonate with readers.</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Writing</h2>
          <Button asChild variant="ghost" className="hover:bg-purple-600 bg-[#6d28d9]">
            <Link href="/works" className="flex items-center">
              View All <FiArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video relative bg-gray-200 animate-pulse"></div>
                <CardHeader>
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-1/3 bg-gray-100 animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-gray-100 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredWritings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No featured writings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWritings.map((item, index) => (
              <Card key={item.id || index} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{item.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost">
                    <Link href={`/works/${item.id}`}>
                      Read More <FiArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Photos</h2>
          <Button asChild variant="ghost" className="hover:bg-purple-600 bg-[#6d28d9]">
            <Link href="/photos" className="flex items-center ">
              View All <FiArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : featuredPhotos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No featured photos available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredPhotos.map((photo, index) => (
              <Link key={index} href="/photos" className="aspect-square relative rounded-lg overflow-hidden group">
                <Image
                  src={photo}
                  alt={`Featured photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


