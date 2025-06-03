"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { FiPlus, FiFilter, FiFolder, FiGrid, FiList, FiDownload, FiTrash2, FiX, FiImage, FiUpload } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Upload, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the Photo interface to match Prisma model
interface Photo {
  id: string
  url: string
  title: string | null
  date: string | Date
  filename: string
  path: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

// Album interface
interface Album {
  id: string
  title: string
  photoCount: number
  coverImage: string
}

interface PhotoCardProps {
  photo: Photo
  onDelete: (id: string) => void
}

// Upload Dialog Component
interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (urls: string[]) => void
}

function UploadDialog({ isOpen, onClose, onUploadComplete }: UploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Replace with your actual Uploadcare public key
  const UPLOADCARE_PUBLIC_KEY = "02a4af4c0ca3c67ea0e6"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const uploadToUploadcare = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY)
    formData.append('file', file)

    const response = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return `https://ucarecdn.com/${data.file}/`
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      const totalFiles = selectedFiles.length
      
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          })
          continue
        }

        // Upload to Uploadcare
        const url = await uploadToUploadcare(file)
        uploadedUrls.push(url)
        
        // Update progress
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      // Call the parent's upload complete handler
      onUploadComplete(uploadedUrls)

      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} photo(s) uploaded successfully.`,
      })

      // Reset and close
      setSelectedFiles(null)
      setUploadProgress(0)
      onClose()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles(null)
      setUploadProgress(0)
      onClose()
    } else {
      toast({
        title: "Upload in progress",
        description: "Please wait for the upload to complete before closing.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Upload your photos to add them to your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm">Uploading photos... {Math.round(uploadProgress)}%</p>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                This may take a while depending on your file sizes and internet connection.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="dropzone-file" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="mb-1 text-sm text-gray-600">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`}
                        className="text-xs flex items-center p-2 rounded bg-gray-50"
                      >
                        <FiImage className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="ml-auto text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
            className="flex items-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const formattedDate = typeof photo.date === 'string' 
    ? new Date(photo.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : (photo.date as Date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

  const handleDownload = () => {
    window.open(photo.url, '_blank')
  }

  const handleDelete = () => {
    onDelete(photo.id)
  }

  return (
    <div className="group relative rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={photo.url}
          alt={photo.title || "Photo"}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
            onClick={handleDownload}
          >
            <FiDownload className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-red-500 hover:text-white shadow-sm"
            onClick={handleDelete}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">{photo.title || "Untitled photo"}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

export default function PhotosPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch photos when component mounts
  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/photos')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setError('Failed to load photos. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = async (urls: string[]) => {
    // Create new photo objects
    const newPhotos = urls.map((url) => {
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 9)
      const filename = `photo-${timestamp}-${randomId}.jpg`
      
      return {
        url,
        title: `Photo ${timestamp}`,
        filename,
        path: `/uploads/photos/${filename}`
      }
    })

    // Add to local state immediately for instant feedback
    const tempPhotos: Photo[] = newPhotos.map((photo, index) => ({
      ...photo,
      id: `temp-${Date.now()}-${index}`,
      date: new Date().toISOString()
    }))
    
    setPhotos(prev => [...tempPhotos, ...prev])

    // Save to database
    try {
      const savedPhotos = await savePhotosToDatabase(newPhotos)
      
      // Replace temporary photos with saved photos (with real IDs from database)
      setPhotos(prev => {
        const withoutTempPhotos = prev.filter(p => !p.id.toString().startsWith('temp-'))
        return [...savedPhotos, ...withoutTempPhotos]
      })

      toast({
        title: "Photos saved",
        description: "Your photos have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving photos to database:", error)
      toast({
        title: "Warning",
        description: "Photos uploaded but may not persist after refresh. Please try uploading again.",
        variant: "destructive",
      })
    }
  }

  const savePhotosToDatabase = async (photos: any[]): Promise<Photo[]> => {
    const response = await fetch('/api/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photos }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  const handleDeletePhoto = async (id: string) => {
    // Optimistically update UI
    setPhotos(prev => prev.filter(photo => photo.id !== id))
    
    try {
      // Skip API call for temporary photos
      if (!id.toString().startsWith('temp-')) {
        const response = await fetch(`/api/photos/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your collection.",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      })
      // Revert the optimistic update by re-fetching photos
      fetchPhotos()
    }
  }

  return (
    <div className="container px-4 py-10 md:py-16 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Photos</h1>
          <p className="text-gray-600 mt-1">
            A visual record of moments and memories ({photos.length} photos)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex items-center"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <FiFilter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by date</DropdownMenuItem>
              <DropdownMenuItem>Sort by name</DropdownMenuItem>
              <DropdownMenuItem>Filter by album</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border rounded-md overflow-hidden flex">
            <Button variant="ghost" size="icon" className="rounded-r-none">
              <FiGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-l-none">
              <FiList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3 mb-8">
          <TabsTrigger value="all">All Photos</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-muted-foreground mt-1">Upload some photos to get started</p>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4">
                <FiPlus className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <PhotoCard key={`photo-${photo.id}`} photo={photo} onDelete={handleDeletePhoto} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {albums.length > 0 ? (
              albums.map((album) => (
                <Card key={`album-${album.id}`} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={album.coverImage || "/placeholder.svg?height=300&width=500"}
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-lg">{album.title}</h3>
                        <p className="text-sm text-white/80">{album.photoCount} photos</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-lg font-medium">No albums yet</h3>
                <p className="text-muted-foreground mt-1">Create an album to organize your photos</p>
                <Button className="mt-4">
                  <FiFolder className="mr-2 h-4 w-4" />
                  Create Album
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-muted-foreground mt-1">Upload some photos to get started</p>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4">
                <FiPlus className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.slice(0, 8).map((photo) => (
                <PhotoCard key={`recent-${photo.id}`} photo={photo} onDelete={handleDeletePhoto} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
