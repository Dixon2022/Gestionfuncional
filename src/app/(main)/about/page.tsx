import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Sobre Nosotros</h1>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">Nuestra Misión</h2>
                <div className="w-16 h-1 bg-secondary mx-auto mb-6"></div>
              </div>
              <p className="text-lg text-gray-700 text-justify leading-relaxed">
                Brindar soluciones inmobiliarias confiables, innovadoras y personalizadas que superen las expectativas
                de nuestros clientes, mediante un equipo profesional comprometido con la excelencia y la integridad.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-10 space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">Nuestra Visión</h2>
                <div className="w-16 h-1 bg-secondary mx-auto mb-6"></div>
              </div>
              <p className="text-lg text-gray-700 text-justify leading-relaxed">
                Ser la empresa líder en servicios inmobiliarios, reconocida por nuestra innovación, compromiso social
                y por generar experiencias de alto valor para nuestros clientes y aliados estratégicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}