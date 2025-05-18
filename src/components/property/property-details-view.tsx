import Image from 'next/image';
import type { Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ContactForm } from './contact-form';
import { BedDouble, Bath, Home, MapPin, Building, CalendarDays, DollarSign, Tag, Layers, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PropertyDetailsViewProps {
  property: Property;
}

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  return (
    <div className="container py-8 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="md:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={property.images[0]}
                alt={property.title}
                layout="fill"
                objectFit="cover"
                priority
                data-ai-hint="property main image"
              />
              {property.isFeatured && (
                <Badge variant="destructive" className="absolute top-4 left-4 text-sm px-3 py-1">Featured</Badge>
              )}
            </div>
            {property.images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {property.images.slice(1, 6).map((img, index) => (
                  <div key={index} className="relative h-24 w-full rounded-md overflow-hidden shadow-md">
                    <Image
                      src={img}
                      alt={`${property.title} - image ${index + 2}`}
                      layout="fill"
                      objectFit="cover"
                       data-ai-hint="property thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Info Header */}
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-3">
              <MapPin className="mr-2 h-5 w-5" />
              <span>{property.address}, {property.city}</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              <DollarSign className="inline-block mr-1 h-7 w-7 relative -top-0.5" />
              {property.price.toLocaleString()}
            </div>
          </div>

          {/* Key Details Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-center">
            {[
              { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
              { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
              { icon: Home, label: 'Area (sqft)', value: property.area.toLocaleString() },
              { icon: Building, label: 'Type', value: property.type },
              { icon: CalendarDays, label: 'Year Built', value: property.yearBuilt || 'N/A' },
              { icon: Layers, label: 'Lot Size (sqft)', value: property.lotSize ? property.lotSize.toLocaleString() : 'N/A' },
            ].map(detail => (
              <div key={detail.label} className="p-4 bg-secondary/50 rounded-lg shadow-sm">
                <detail.icon className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{detail.label}</p>
                <p className="font-semibold text-lg">{detail.value}</p>
              </div>
            ))}
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Property Description</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">Features</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    <Tag className="mr-1.5 h-3.5 w-3.5"/>
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column (Agent Info & Contact Form) */}
        <div className="md:col-span-1 space-y-8">
          {/* Agent Info Card */}
          <div className="p-6 border rounded-lg shadow-lg bg-card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-primary" />
                Listing Agent
            </h3>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={property.agent.avatarUrl} alt={property.agent.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{property.agent.name.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{property.agent.name}</p>
                <p className="text-sm text-muted-foreground">Real Estate Agent</p>
              </div>
            </div>
            <Separator className="my-4"/>
            <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> <a href={`mailto:${property.agent.email}`} className="text-primary hover:underline">{property.agent.email}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${property.agent.phone}`} className="text-primary hover:underline">{property.agent.phone}</a></p>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm 
            propertyId={property.id} 
            agentEmail={property.agent.email} 
            agentName={property.agent.name} 
          />
        </div>
      </div>
    </div>
  );
}
