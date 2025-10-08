"use client";

import { useForm } from "@tanstack/react-form";
import { createExperienceAction } from "@web/action/experience";
import { Button } from "@web/components/ui/button";
import { useCreateExperience } from "@web/hooks/use-experiences";
import { ImageModal } from "@web/components/ui/image-modal";
import { CameraCapture } from "@web/components/ui/camera-capture";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import type { Category } from "@web/types";
import { MapPin, Camera, X, Image as Picture } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState, useEffect } from "react";
import z from "zod";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@web/components/animate-ui/components/base/tooltip";

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

interface CreateExperienceCardProps {
  categoryOptions: Category;
}

export default function CreateExperienceCard({
  categoryOptions,
}: CreateExperienceCardProps) {
  const [location, setLocation] = useState<{
    latitude: string;
    longitude: string;
    address: string;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Request location permission on component mount
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const requestLocationPermission = () => {
      if (navigator.geolocation) {
        // Check if we can get the current position (this will trigger permission request)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Permission granted, get location immediately
            const lat = position.coords.latitude.toString();
            const lng = position.coords.longitude.toString();

            // Get address from coordinates using OpenStreetMap Nominatim for street-level precision
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "User-Agent":
                    "BrokenExperiences/1.0 (https://brokenexperiences.com)",
                },
              }
            )
              .then((response) => response.json())
              .then((data) => {
                console.log(
                  "🌍 OpenStreetMap Nominatim API response:",
                  JSON.stringify(data, null, 2)
                );

                // Extract detailed address components from Nominatim
                const address = data.address || {};
                const components: string[] = [];

                // Build address from most specific to least specific
                if (address.house_number && address.road) {
                  components.push(`${address.house_number} ${address.road}`);
                } else if (address.road) {
                  components.push(address.road);
                }

                // Add neighborhood/suburb/district
                if (address.neighbourhood) {
                  components.push(address.neighbourhood);
                } else if (address.suburb) {
                  components.push(address.suburb);
                } else if (address.district) {
                  components.push(address.district);
                }

                // Add city/town/village
                if (address.city) {
                  components.push(address.city);
                } else if (address.town) {
                  components.push(address.town);
                } else if (address.village) {
                  components.push(address.village);
                }

                // Add parish/county/state (for Jamaica context)
                if (address.county && !components.includes(address.county)) {
                  components.push(address.county);
                } else if (
                  address.state &&
                  !components.includes(address.state)
                ) {
                  components.push(address.state);
                }

                // Create final address string
                let finalAddress =
                  components.length > 0
                    ? components.slice(0, 3).join(", ") // Limit to 3 most specific components
                    : data.display_name?.split(",").slice(0, 3).join(", ") ||
                      null;

                // Fallback to coordinate-based description if no detailed address
                if (
                  !finalAddress ||
                  (finalAddress.includes("Jamaica") && components.length === 0)
                ) {
                  const latRounded = parseFloat(lat).toFixed(4);
                  const lngRounded = parseFloat(lng).toFixed(4);
                  finalAddress = `Location at ${latRounded}°N, ${lngRounded}°W`;
                }

                console.log("📍 Nominatim address parsing:", {
                  addressComponents: address,
                  extractedComponents: components,
                  finalAddress: finalAddress,
                  displayName: data.display_name,
                });

                setLocation({
                  latitude: lat,
                  longitude: lng,
                  address: finalAddress,
                });
                setLocationPermission("granted");
              })
              .catch(() => {
                // If reverse geocoding fails, still set location with coordinates
                setLocation({
                  latitude: lat,
                  longitude: lng,
                  address: "Location obtained",
                });
                setLocationPermission("granted");
              });
          },
          (error) => {
            console.log("Location permission denied or error:", error);
            setLocationPermission("denied");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        setLocationPermission("denied");
      }
    };

    requestLocationPermission();

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();

          console.log("📍 Got location:", { lat, lng });

          // Get address from coordinates using OpenStreetMap Nominatim for street-level precision
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "User-Agent":
                  "BrokenExperiences/1.0 (https://brokenexperiences.com)",
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(
                "🌍 Manual - OpenStreetMap Nominatim API response:",
                JSON.stringify(data, null, 2)
              );

              // Extract detailed address components from Nominatim
              const address = data.address || {};
              const components: string[] = [];

              // Build address from most specific to least specific
              if (address.house_number && address.road) {
                components.push(`${address.house_number} ${address.road}`);
              } else if (address.road) {
                components.push(address.road);
              }

              // Add neighborhood/suburb/district
              if (address.neighbourhood) {
                components.push(address.neighbourhood);
              } else if (address.suburb) {
                components.push(address.suburb);
              } else if (address.district) {
                components.push(address.district);
              }

              // Add city/town/village
              if (address.city) {
                components.push(address.city);
              } else if (address.town) {
                components.push(address.town);
              } else if (address.village) {
                components.push(address.village);
              }

              // Add parish/county/state (for Jamaica context)
              if (address.county && !components.includes(address.county)) {
                components.push(address.county);
              } else if (address.state && !components.includes(address.state)) {
                components.push(address.state);
              }

              // Create final address string
              let finalAddress =
                components.length > 0
                  ? components.slice(0, 3).join(", ") // Limit to 3 most specific components
                  : data.display_name?.split(",").slice(0, 3).join(", ") ||
                    null;

              // Fallback to coordinate-based description if no detailed address
              if (
                !finalAddress ||
                (finalAddress.includes("Jamaica") && components.length === 0)
              ) {
                const latRounded = parseFloat(lat).toFixed(4);
                const lngRounded = parseFloat(lng).toFixed(4);
                finalAddress = `Location at ${latRounded}°N, ${lngRounded}°W`;
              }

              console.log("📍 Manual - Nominatim address parsing:", {
                addressComponents: address,
                extractedComponents: components,
                finalAddress: finalAddress,
                displayName: data.display_name,
              });

              setLocation({
                latitude: lat,
                longitude: lng,
                address: finalAddress,
              });
              setLocationPermission("granted");
              setIsGettingLocation(false);
            })
            .catch(() => {
              // If reverse geocoding fails, still set location with coordinates
              setLocation({
                latitude: lat,
                longitude: lng,
                address: "Location obtained",
              });
              setLocationPermission("granted");
              setIsGettingLocation(false);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationPermission("denied");
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
      setLocationPermission("denied");
      setIsGettingLocation(false);
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handleCancel = () => {
    // Reset form
    form.reset();
    // Clear photos and revoke object URLs
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    // Clear location
    setLocation(null);
    // Collapse form
    setIsExpanded(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: PhotoFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    // Expand the form when photos are added so they're visible immediately
    setIsExpanded(true);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleCameraCapture = (file: File) => {
    const newPhoto: PhotoFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    };
    setPhotos((prev) => [...prev, newPhoto]);
    // Expand the form when photos are captured so they're visible immediately
    setIsExpanded(true);
  };

  const form = useForm({
    defaultValues: {
      description: "",
      categoryId: "",
      priority: "medium",
      status: "pending",
    },
    onSubmit: async ({ value }) => {
      if (!location) {
        toast.error("Location is required");
        return;
      }

      // Upload images if any
      let imageUrls: string[] = [];
      if (photos.length > 0) {
        try {
          console.log("📸 Starting image upload for", photos.length, "files");
          toast.info("Uploading images...");
          const { uploadMultipleImages } = await import(
            "@web/lib/supabase/storage"
          );
          imageUrls = await uploadMultipleImages(photos.map((p) => p.file));
          console.log("✅ Images uploaded successfully:", imageUrls);
          toast.success(`${imageUrls.length} image(s) uploaded!`);
        } catch (error) {
          console.error("❌ Image upload failed:", error);
          toast.error("Failed to upload images. Posting without images...");
        }
      }

      const submission = {
        categoryId: value.categoryId,
        title: value.description.substring(0, 50),
        description: value.description,
        priority: value.priority || "medium",
        status: value.status || "pending",
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        imageUrls: imageUrls,
      };
      console.log("📤 Submitting experience with data:", submission);
      // Use TanStack Query mutation for better performance
      createExperience(submission, {
        onSuccess: () => {
          console.log("✅ Experience created successfully with TanStack Query");
          toast.success("Experience posted successfully!");
          // Reset form on success
          form.reset();
          // Reset location and photos
          setLocation(null);
          photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
          setPhotos([]);
          setIsExpanded(false);
          // TanStack Query will automatically refetch and update the feed
        },
        onError: (error) => {
          console.error("❌ Experience creation failed:", error);
          toast.error("Failed to create experience. Please try again.");
        },
      });
    },
    validators: {
      onSubmit: z.object({
        description: z.string().min(5, "Please provide at least 5 characters"),
        categoryId: z.string().min(1, "Category is required"),
        priority: z.string(),
        status: z.string(),
      }),
    },
  });

  // Use TanStack Query for creating experiences
  const { mutate: createExperience, isPending: isExecuting } =
    useCreateExperience();

  const { execute, isExecuting: isExecutingAction } = useAction(
    createExperienceAction,
    {
      onSuccess: (data) => {
        console.log("✅ Experience created successfully:", data);

        // Check if there was actually an error in the response
        if (data && typeof data === "object" && "error" in data) {
          console.error("❌ Server returned error:", data);
          const errorData = data as any;
          toast.error(
            `Failed: ${errorData.message || errorData.error || "Unknown error"}`
          );
          return;
        }

        // Show success toast
        toast.success("Experience posted successfully!");

        // Reset form on success
        form.reset();
        // Reset location and photos
        setLocation(null);
        photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
        setIsExpanded(false);
        // Reload page to show new post
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      onError: (error) => {
        console.error("❌ Failed to create experience:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));

        // Extract more detailed error message
        let errorMessage = "Failed to create experience. Please try again.";
        if (error?.error?.serverError) {
          errorMessage = `Server error: ${error.error.serverError}`;
        } else if (error?.error?.validationErrors) {
          errorMessage = `Validation error: ${JSON.stringify(error.error.validationErrors)}`;
        } else if (error?.error) {
          errorMessage = `Error: ${JSON.stringify(error.error)}`;
        }

        alert(errorMessage);
      },
    }
  );

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-2"
      >
        <div className="flex space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <form.Field name="description">
              {(field) => (
                <>
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={
                      isExpanded
                        ? "Describe the slackness you want fixed..."
                        : "Report the Slackness!"
                    }
                    value={field.state.value}
                    onFocus={() => {
                      // Expand when user clicks/focuses on the input
                      if (!isExpanded) {
                        setIsExpanded(true);
                      }
                    }}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    className="w-full resize-none bg-transparent text-lg sm:text-xl text-black placeholder:text-gray-400 focus:outline-none min-h-[40px] break-words"
                    rows={isExpanded ? 3 : 1}
                    maxLength={500}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message || "Error"}
                    </p>
                  )}
                  {isExpanded && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {field.state.value.length}/500
                    </p>
                  )}
                </>
              )}
            </form.Field>
          </div>
        </div>

        {/* Enhanced features when expanded */}
        {isExpanded && (
          <>
            {/* Photo upload section */}
            <div className="ml-10 space-y-2">
              {photos.length > 0 && (
                <div className="flex gap-2.5 flex-wrap">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <div
                        className="w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      >
                        <img
                          src={photo.preview}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                          loading="eager"
                          onLoad={() =>
                            console.log("✅ Image loaded:", photo.preview)
                          }
                          onError={(e) => {
                            console.error(
                              "❌ Image preview error:",
                              photo.preview
                            );
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Location display only when permission is denied */}
              {locationPermission === "denied" && (
                <div className="text-xs text-red-600 p-1.5 bg-red-50 rounded-md">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="font-medium">
                      Location permission required
                    </span>
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="ml-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Photo upload button - Always visible */}
            <label className="cursor-pointer">
              <div className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors">
                <Picture className="h-4 w-4" />
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            {/* Camera button for mobile devices */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}

            {/* Location button - hide when location is granted */}
            {!(location && locationPermission === "granted") && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={
                        isGettingLocation || locationPermission === "denied"
                      }
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors disabled:opacity-50 ${
                        locationPermission === "denied"
                          ? "bg-red-50 text-red-600 border border-red-200 cursor-not-allowed"
                          : "hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-200"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  }
                />
                <TooltipPanel>
                  {locationPermission === "denied"
                    ? "Enable location to post"
                    : "Get location..."}
                </TooltipPanel>
              </Tooltip>
            )}
            <form.Field name="categoryId">
              {(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-[90px] h-7 text-xs border-gray-200 bg-white text-gray-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categoryOptions) &&
                        categoryOptions.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">
                      {typeof field.state.meta.errors[0] === "string"
                        ? field.state.meta.errors[0]
                        : field.state.meta.errors[0]?.message || "Error"}
                    </p>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div className="flex items-center gap-1.5">
            {isExpanded && (
              <Button
                type="button"
                onClick={handleCancel}
                className="rounded-full bg-gray-100 font-medium text-gray-700 hover:bg-gray-200 px-3 py-1 text-md"
              >
                Cancel
              </Button>
            )}
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="rounded-full bg-black font-medium text-white text-md hover:bg-gray-800 disabled:opacity-50 px-4 py-1 "
                  disabled={
                    !state.canSubmit ||
                    state.isSubmitting ||
                    isExecuting ||
                    !location ||
                    !location.latitude ||
                    !location.longitude
                  }
                >
                  {state.isSubmitting || isExecuting ? "Posting..." : "Post"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </form>

      {/* Image Modal */}
      {photos.length > 0 && (
        <ImageModal
          images={photos.map((photo) => photo.preview)}
          currentIndex={currentImageIndex}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onIndexChange={setCurrentImageIndex}
        />
      )}

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />
    </div>
  );
}
