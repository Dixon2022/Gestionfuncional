import React from "react";

export default function FAQPage() {
  const faqs = [
    {
      question: "¿Cómo puedo contactar a un agente inmobiliario?",
      answer: "Puedes contactar a nuestros agentes a través del formulario en nuestra página de contacto, llamando a nuestro número de atención al cliente o visitando cualquiera de nuestras oficinas."
    },
    {
      question: "¿Qué documentos necesito para comprar una propiedad?",
      answer: "Los documentos básicos son identificación oficial, comprobante de domicilio, estados de cuenta y en algunos casos, constancia de situación fiscal. Para casos específicos, nuestros agentes te orientarán sobre los requisitos adicionales."
    },
    {
      question: "¿Cuál es el proceso de compra de una propiedad?",
      answer: "Nuestro proceso consta de 5 pasos: 1) Evaluación de necesidades, 2) Búsqueda y selección de propiedades, 3) Visitas y valoración, 4) Negociación y trámites legales, 5) Firma de escrituras. Todo el proceso es guiado por nuestros especialistas."
    },
    {
      question: "¿Ofrecen financiamiento o créditos hipotecarios?",
      answer: "Trabajamos con las principales instituciones financieras para ofrecerte las mejores opciones de crédito hipotecario. Nuestros asesores te ayudarán a comparar y seleccionar la opción que mejor se adapte a tus necesidades."
    },
    {
      question: "¿Cuánto tiempo tarda el trámite de compra-venta?",
      answer: "El tiempo promedio es de 30 a 60 días hábiles, dependiendo de la complejidad de la operación y la rapidez en la obtención de documentos. En casos sencillos puede reducirse a 3 semanas."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Preguntas Frecuentes</h1>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre nuestros servicios inmobiliarios
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                <h3 className="text-2xl font-semibold text-primary mb-4">{faq.question}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600">
            ¿No encontraste lo que buscabas? Contáctanos y con gusto te ayudaremos.
          </p>
        </div>
      </div>
    </div>
  );
}