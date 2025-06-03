"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { FiEdit, FiImage, FiAlignLeft, FiExternalLink, FiFilter, FiRefreshCw } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

// Define interfaces
interface Writing {
  id: string
  title: string
  category: string
  description: string
  image: string
  tags: string[]
  date: string
  contentUrl: string
}

interface Photo {
  id: string
  url: string
  title: string | null
  date: string | Date
  filename: string
  path: string
}

interface ContentItem {
  id: string
  title: string
  type: "writing" | "photo"
  date: string
  thumbnail: string
  description?: string
  url: string
  category?: string
  tags?: string[]
}

export default function MorePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [writings, setWritings] = useState<Writing[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "writings" | "photos">("all")

  useEffect(() => {
    fetchAllContent()
  }, [])

  useEffect(() => {
    // Combine and sort all content when writings or photos change
    const combined: ContentItem[] = [
      ...writings.map(writing => ({
        id: writing.id,
        title: writing.title,
        type: "writing" as const,
        date: writing.date,
        thumbnail: writing.image,
        description: writing.description,
        url: `/works/${writing.id}`,
        category: writing.category,
        tags: writing.tags
      })),
      ...photos.map(photo => ({
        id: photo.id,
        title: photo.title || "Untitled Photo",
        type: "photo" as const,
        date: typeof photo.date === 'string' ? photo.date : photo.date.toISOString(),
        thumbnail: photo.url,
        url: `/photos/${photo.id}`,
      }))
    ]

    // Sort by date (newest first)
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setAllContent(combined)
    setIsLoading(false)
  }, [writings, photos])

  const fetchAllContent = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch writings
      const fetchWritings = async () => {
        const response = await fetch('/api/writings')
        if (!response.ok) {
          throw new Error(`Failed to fetch writings: ${response.status}`)
        }
        return await response.json()
      }
      
      // Fetch photos
      const fetchPhotos = async () => {
        const response = await fetch('/api/photos')
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status}`)
        }
        return await response.json()
      }
      
      // Execute both fetches concurrently
      const [writingsData, photosData] = await Promise.all([
        fetchWritings(),
        fetchPhotos()
      ])
      
      setWritings(writingsData)
      setPhotos(photosData)
    } catch (error) {
      console.error('Error fetching content:', error)
      setError('Failed to load content. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter content based on search query and active filter
  const filteredContent = allContent.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    
    const matchesFilter = 
      activeFilter === "all" || 
      (activeFilter === "writings" && item.type === "writing") || 
      (activeFilter === "photos" && item.type === "photo")
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container px-4 py-10 md:py-16 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Content</h1>
          <p className="text-gray-600 mt-1">
            All your writings and photos in one place
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchAllContent()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FiRefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div>
              <h2 className="font-medium">Search</h2>
              <div className="relative mt-2">
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="font-medium">Content Type</h2>
              <div className="mt-2 space-y-2">
                <div 
                  className={`flex items-center cursor-pointer p-2 rounded-md ${activeFilter === "all" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
                  onClick={() => setActiveFilter("all")}
                >
                  <span className="ml-2">All Content</span>
                  <Badge className="ml-auto">{allContent.length}</Badge>
                </div>
                <div 
                  className={`flex items-center cursor-pointer p-2 rounded-md ${activeFilter === "writings" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
                  onClick={() => setActiveFilter("writings")}
                >
                  <FiAlignLeft className="h-4 w-4 text-gray-600" />
                  <span className="ml-2">Writings</span>
                  <Badge className="ml-auto">{writings.length}</Badge>
                </div>
                <div 
                  className={`flex items-center cursor-pointer p-2 rounded-md ${activeFilter === "photos" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
                  onClick={() => setActiveFilter("photos")}
                >
                  <FiImage className="h-4 w-4 text-gray-600" />
                  <span className="ml-2">Photos</span>
                  <Badge className="ml-auto">{photos.length}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="font-medium">Quick Links</h2>
              <div className="mt-2 space-y-2">
                <Link href="/works" className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <FiEdit className="h-4 w-4 text-gray-600" />
                  <span className="ml-2">Go to Writings</span>
                </Link>
                <Link href="/photos" className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <FiImage className="h-4 w-4 text-gray-600" />
                  <span className="ml-2">Go to Photos</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    <div className="h-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FiFilter className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No content found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("")
                  setActiveFilter("all")
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.type === "writing" ? "secondary" : "default"}>
                        {item.type === "writing" ? (
                          <FiAlignLeft className="h-3 w-3 mr-1" />
                        ) : (
                          <FiImage className="h-3 w-3 mr-1" />
                        )}
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(item.date)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.description ? (
                      <p className="text-gray-700 line-clamp-2">{item.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description available</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={item.url} className="w-full">
                      <Button variant="outline" className="w-full">
                        <FiExternalLink className="mr-2 h-4 w-4" />
                        View {item.type}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
