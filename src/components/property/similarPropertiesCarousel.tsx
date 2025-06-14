import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";

interface Props {
  properties: Property[];
}

export function SimilarPropertiesCarousel({ properties }: Props) {
  // Elimina duplicados por id
  const uniqueProperties = properties.filter(
    (prop, index, self) =>
      index === self.findIndex((p) => p.id === prop.id)
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(3, uniqueProperties.length),
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, uniqueProperties.length) },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">
        También te podría interesar...
      </h2>
      <Slider {...settings}>
        {uniqueProperties.map((prop) => (
          <div key={prop.id} className="px-2 h-full">
            <Link href={`/properties/${prop.id}`}>
              <div className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-xl transition">
                <div className="relative h-40 w-full">
                  <Image
                    src={
                      prop.photoDataUri ||
                      (Array.isArray(prop.images) && prop.images.length > 0
                        ? prop.images[0]
                        : "/default-image.png")
                    }
                    alt={prop.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-lg">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.city}</p>
                  <p className="text-primary font-semibold">
                    ₡{prop.price?.toLocaleString() ?? "N/A"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}