import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

// Schema for validating the contact form data
const contactAgentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  propertyId: z.string(),
  propertyName: z.string(),
  agentEmail: z.string().email({ message: "Invalid agent email address." }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = contactAgentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input.", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, phone, message, propertyId, propertyName, agentEmail } = validation.data;

    // In a real application, you would integrate an email sending service here.
    // For example, using Nodemailer, SendGrid, Resend, etc.
    
    console.log("---- New Agent Contact Request ----");
    console.log(`Property ID: ${propertyId}`);
    console.log(`Property Name: ${propertyName}`);
    console.log(`Prospective Buyer/Renter Name: ${name}`);
    console.log(`Prospective Buyer/Renter Email: ${email}`);
    if (phone) {
      console.log(`Prospective Buyer/Renter Phone: ${phone}`);
    }
    console.log(`Message: ${message}`);
    console.log(`Intended Recipient (Agent Email): ${agentEmail}`);
    console.log("---- End of Agent Contact Request ----");

    // Simulate successful email sending
    return NextResponse.json({ success: true, message: `Contact request for property "${propertyName}" sent to agent ${agentEmail}.` });

  } catch (error) {
    console.error("Error in /api/contact-agent:", error);
    return NextResponse.json({ error: "Internal Server Error. Could not process the contact request." }, { status: 500 });
  }
}
