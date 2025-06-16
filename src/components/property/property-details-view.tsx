import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ContactForm } from "./contact-form";
import {
  BedDouble,
  Bath,
  Home,
  MapPin,
  Building,
  CalendarDays,
  Layers,
  UserCircle,
  Landmark,
  Tag,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { Copy } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { useAuth } from "@/contexts/auth-context";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import SimilarPropertiesCarousel from "./similarPropertiesCarousel";

// Update the path below if your report-form file is in a different directory

interface PropertyDetailsPageProps {
  propertyId: string; // Recibimos el ID de la propiedad para hacer fetch
}

export function PropertyDetailsPage({ propertyId }: PropertyDetailsPageProps) {
  const { user } = useAuth(); // <-- aquí obtienes el usuario
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const { convert, symbol } = useCurrency();
  const [mainImgError, setMainImgError] = useState(false);
  const [thumbsError, setThumbsError] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/property/${propertyId}`);
        if (!res.ok) throw new Error("Error al cargar la propiedad");
        const data: Property = await res.json();
        setProperty(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    async function fetchReports() {
      if (user?.role === "admin") {
        const res = await fetch(
          `/api/report-property?propertyId=${propertyId}`
        );
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      }
    }
    fetchReports();
  }, [propertyId, user]);

  useEffect(() => {
    async function fetchSimilar() {
      if (!property) return;
      const res = await fetch(
        `/api/property/similar?city=${property.city}&type=${property.type}&exclude=${property.id}`
      );
      if (res.ok) {
        setSimilarProperties(await res.json());
      }
    }
    fetchSimilar();
  }, [property]);

  if (loading) return <p>Cargando propiedad...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!property) return <p>No se encontró la propiedad.</p>;

  // Validación segura para toLocaleString
  const displayArea =
    property.area != null ? `${property.area.toLocaleString()} m²` : "N/A";
  const displayLotSize =
    property.lotSize != null
      ? `${property.lotSize.toLocaleString()} m²`
      : "N/A";
  const displayPrice =
    property.price != null
      ? `${symbol}${convert(property.price).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`
      : "Precio no disponible";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 py-8">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content Column */}
          <div className="md:col-span-2 bg-white/90 rounded-2xl shadow-2xl p-6">
            {/* Galería de imágenes principal con miniaturas debajo */}
            {property.images && property.images.length > 0 ? (
              <div className="mb-8 flex flex-col items-center">
                {/* Imagen principal */}
                <div
                  className="relative w-full max-w-2xl h-[250px] md:h-[450px] rounded-xl overflow-hidden shadow-lg bg-white flex justify-center items-center cursor-pointer"
                  onClick={() => setShowModal(true)}
                  title="Ver imagen completa"
                >
                  <Image
                    src={
                      typeof property.images[mainImageIdx] === "string"
                        ? property.images[mainImageIdx]
                        : (property.images[mainImageIdx] as { url: string }).url
                    }
                    alt={`Imagen principal ${mainImageIdx + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl transition-transform hover:scale-105"
                    priority
                    data-ai-hint="imagen propiedad principal"
                  />
                </div>
                {/* Miniaturas debajo */}
                {property.images.length > 1 && (
                  <div className="flex flex-row gap-2 mt-4 justify-start items-center">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMainImageIdx(idx)}
                        className={`
                        relative rounded-lg overflow-hidden shadow
                        border-2 ${
                          mainImageIdx === idx
                            ? "border-blue-500"
                            : "border-transparent"
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        transition-all
                        bg-white
                        ${mainImageIdx === idx ? "scale-105" : ""}
                      `}
                        style={{ width: 100, height: 84 }}
                        title={`Ver imagen ${idx + 1}`}
                      >
                        <Image
                          src={
                            typeof img === "string"
                              ? img
                              : (img as { url: string }).url
                          }
                          alt={`Miniatura ${idx + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-lg"
                          data-ai-hint="miniatura propiedad"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* Modal para ver imagen completa */}
                {showModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setShowModal(false)}
                  >
                    <div
                      className="relative max-w-3xl w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 hover:bg-white"
                        onClick={() => setShowModal(false)}
                        aria-label="Cerrar"
                      >
                        ✕
                      </button>
                      <Image
                        src={
                          typeof property.images[mainImageIdx] === "string"
                            ? property.images[mainImageIdx]
                            : (property.images[mainImageIdx] as { url: string })
                                .url
                        }
                        alt={`Imagen ampliada ${mainImageIdx + 1}`}
                        width={900}
                        height={600}
                        className="rounded-xl mx-auto shadow-lg object-contain bg-white"
                        style={{
                          maxHeight: "80vh",
                          width: "auto",
                          height: "auto",
                        }}
                        data-ai-hint="imagen propiedad ampliada"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8 flex flex-col items-center">
                <div
                  className="relative w-full max-w-2xl h-[250px] md:h-[450px] rounded-xl overflow-hidden shadow-lg bg-gray-200 flex justify-center items-center"
                  title="Sin imagen"
                >
                  <span className="text-gray-500 text-2xl font-semibold text-center px-4">
                    {property.title}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 pt-0 mt-2 flex items-center justify-center">
              <div className="flex flex-row gap-6">
                <div className="flex flex-col items-center">
                  <FacebookShareButton
                    url={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/properties/${property.id}`}
                    className="group"
                    title="Compartir en Facebook"
                  >
                    <div className="rounded-full bg-blue-600 group-hover:bg-blue-700 transition-colors shadow-xl p-3 flex items-center justify-center">
                      <FacebookIcon size={32} round />
                    </div>
                  </FacebookShareButton>
                  <span className="text-xs mt-2 text-blue-700 group-hover:font-semibold transition-all select-none">
                    Facebook
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <WhatsappShareButton
                    url={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/properties/${property.id}`}
                    className="group"
                    title="Compartir en WhatsApp"
                  >
                    <div className="rounded-full bg-green-500 group-hover:bg-green-600 transition-colors shadow-xl p-3 flex items-center justify-center">
                      <WhatsappIcon size={32} round />
                    </div>
                  </WhatsappShareButton>
                  <span className="text-xs mt-2 text-green-700 group-hover:font-semibold transition-all select-none">
                    WhatsApp
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/properties/${property.id}`
                      );
                      toast({
                        title: "Enlace copiado",
                        description: "Has copiado el enlace de la propiedad.",
                        duration: 7000,
                      });
                    }}
                    title="Copiar enlace"
                    className="group"
                  >
                    <div className="rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors shadow-xl p-3 flex items-center justify-center">
                      <Copy className="h-7 w-7 text-gray-700" />
                    </div>
                  </button>
                  <span className="text-xs mt-2 text-gray-700 group-hover:font-semibold transition-all select-none">
                    Copiar
                  </span>
                </div>
              </div>
            </div>

            {/* Property Info Header */}
            <div className="mb-6 pb-4 border-b">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {property.title}
              </h1>

              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="mr-2 h-5 w-5" />
                <span>
                  {property.address}, {property.city}
                </span>
              </div>
              <div className="text-3xl font-bold text-primary">
                <Landmark className="inline-block mr-1 h-7 w-7 relative -top-0.5" />
                {displayPrice}
                <span className="text-xl font-medium text-foreground/80 ml-2">
                  ({property.listingType})
                </span>
                {property.listingType === "Alquiler" ? (
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}
                    /mes
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Key Details Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-center">
              {[
                {
                  icon: BedDouble,
                  label: "Habitaciones",
                  value: property.bedrooms,
                },
                { icon: Bath, label: "Baños", value: property.bathrooms },
                { icon: Home, label: "Superficie (m²)", value: displayArea },
                { icon: Building, label: "Tipo Prop.", value: property.type },
                { icon: Tag, label: "Listado", value: property.listingType },
                {
                  icon: CalendarDays,
                  label: "Año Const.",
                  value: property.yearBuilt || "N/A",
                },
                {
                  icon: Layers,
                  label: "Sup. Terreno (m²)",
                  value: displayLotSize,
                },
              ].map((detail) => (
                <div
                  key={detail.label}
                  className="p-4 bg-secondary/50 rounded-lg shadow-sm"
                >
                  <detail.icon className="h-7 w-7 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="font-semibold text-lg">{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                Descripción de la Propiedad
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* AQUI SE AGREGAN LOS REPORTES POR SI ACASO */}
            {user?.role === "admin" && (
              <div className="mb-8">
                <p className="text-2xl font-semibold mb-3">
                  Reportes de la propiedad
                </p>
                {reports.length === 0 ? (
                  <p className="text-muted-foreground">
                    No hay reportes para esta propiedad.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {reports.map((report, idx) => (
                      <li
                        key={report.id}
                        className="p-4 border rounded-lg bg-secondary/30 flex flex-col gap-2"
                      >
                        <div>
                          <p className="font-semibold">
                            Motivo: {report.reason}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Mensaje: {report.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fecha: {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          className="self-end px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          onClick={async () => {
                            if (confirm("¿Eliminar este reporte?")) {
                              const res = await fetch(
                                `/api/report-property?id=${report.id}`,
                                {
                                  method: "DELETE",
                                }
                              );
                              if (res.ok) {
                                setReports(
                                  reports.filter((r) => r.id !== report.id)
                                );
                                toast({
                                  title: "Reporte eliminado",
                                  description: "El reporte ha sido eliminado.",
                                });
                              } else {
                                toast({
                                  title: "Error",
                                  description:
                                    "No se pudo eliminar el reporte.",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">Características</h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      <Layers className="mr-1.5 h-3.5 w-3.5" />
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
                Agente Inmobiliario
              </h3>

              {property.owner ? (
                <>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={property.owner.avatarUrl || "/default-avatar.png"}
                        alt={property.owner.name}
                        data-ai-hint="retrato persona"
                      />
                      <AvatarFallback>
                        {property.owner.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">
                        {property.owner.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Agente Inmobiliario
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email: </strong>
                      {property.owner.email ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
                            property.owner.email
                          }&su=Hola%20desde%20la%20plataforma&body=Hola%20${encodeURIComponent(
                            property.owner.name || ""
                          )},%20me%20gustaría%20contactarte%20sobre%20una%20propiedad.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title="Redactar en Gmail"
                        >
                          {property.owner.email}
                        </a>
                      ) : (
                        "No disponible"
                      )}
                    </p>
                    <p>
                      <strong>Teléfono: </strong>
                      {property.owner.phone ? (
                        <a
                          className="text-primary hover:underline"
                          onClick={() => {
                            navigator.clipboard.writeText(property.owner.phone);
                            toast({
                              title: "¡Número copiado!",
                              description:
                                "El número de teléfono se copió al portapapeles.",
                              duration: 3000,
                            });
                          }}
                        >
                          {property.owner.phone}
                        </a>
                      ) : (
                        "No disponible"
                      )}
                    </p>
                  </div>
                  {property.owner.userDescription && (
                    <div className="mb-2">
                      <br></br>
                       <strong>Sobre mí: </strong>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {property.owner.userDescription}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p>Información del ownere no disponible</p>
              )}
            </div>

            {/* Contact Form */}
            {/* Solo renderizamos el ContactForm si hay ownere */}
            {property.owner && (
              <ContactForm
                propertyId={property.id}
                propertyName={property.title}
                agentEmail={property.owner.email}
                agentName={property.owner.name}
              />
            )}
          </div>
          <div className="md:col-span-2 space-y-8 mt-1 bg-white/90 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 justify-center text-center ">
              Propiedades Similares
            </h2>
            {similarProperties.length > 0 ? (
              <SimilarPropertiesCarousel
                properties={similarProperties}
                currentPropertyId={property.id}
              />
            ) : (
              <p className="text-center text-muted-foreground mt-8">
                No se encontraron propiedades similares.
              </p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
