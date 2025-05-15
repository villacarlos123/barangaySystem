import React, { useState, useEffect, useRef } from "react";
import { jsPDF, GState } from "jspdf";
import axios from 'axios';
import { 
  Download, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Trash
} from "lucide-react";

import { getData } from "../utils/getData";
import Seal from "../seal.jpg"
import Logo from "../logo.jpg"

interface DocumentDetails {
  requester_name: string;
  requester_email: string;
  documentId: string;
  document_type: string;
  residentId: string;
}

interface Resident {
  age: number;
  civil_status: string;
  barangay: string;
  yearsResidency: string;
}

type DrawingEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

const CertificationGenerator = ({ documentDetails }: { documentDetails: DocumentDetails }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureContextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const {data: resident} = getData('residents/' + documentDetails?.residentId) as unknown as { data: Resident | undefined };

  // Initialize signature pad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    signatureContextRef.current = context;
  }, []);

  // Drawing functions
  const startDrawing = (e: DrawingEvent) => {
    if (!signatureContextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    signatureContextRef.current.beginPath();
    signatureContextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: DrawingEvent) => {
    if (!isDrawing || !signatureContextRef.current) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    signatureContextRef.current.lineTo(offsetX, offsetY);
    signatureContextRef.current.stroke();
  };

  const finishDrawing = () => {
    if (!signatureContextRef.current || !canvasRef.current) return;
    signatureContextRef.current.closePath();
    setIsDrawing(false);
    setSignature(canvasRef.current.toDataURL("image/png"));
  };

  // Get coordinates for both mouse and touch events
  const getCoordinates = (e: DrawingEvent) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
    
    if ('touches' in e.nativeEvent) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.nativeEvent.touches[0].clientX - rect.left,
        offsetY: e.nativeEvent.touches[0].clientY - rect.top
      };
    } else {
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
  };

  // Clear signature pad
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  // Function to generate PDF
  const generatePDF = async () => {
    if (!signature) {
      setErrorMessage("Please sign the document before generating the PDF.");
      return null;
    }
    
    setIsGenerating(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Add background logo with blur effect
      // Create blur effect by layering the logo with different opacities and slight offsets
      const logoX = 55;
      const logoY = 80;
      const logoSize = 100;
      
      // Layer 1: Very faint, slightly offset for blur effect
      doc.setGState(new GState({ opacity: 0.02 }));
      doc.addImage(Logo, 'JPEG', logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
      
      // Layer 2: Faint, slight offset
      doc.setGState(new GState({ opacity: 0.03 }));
      doc.addImage(Logo, 'JPEG', logoX - 1, logoY - 1, logoSize + 2, logoSize + 2);
      
      // Layer 3: Main logo layer with very low opacity
      doc.setGState(new GState({ opacity: 0.05 }));
      doc.addImage(Logo, 'JPEG', logoX, logoY, logoSize, logoSize);
      
      // Reset opacity for other elements
      doc.setGState(new GState({ opacity: 1 }));
      
      // Add seal at the upper right
      doc.addImage(Seal, 'JPEG', 150, 20, 40, 40);
      
      // Set font
      doc.setFont("helvetica", "normal");
      
      // Add header text
      doc.setFontSize(10);
      doc.text("Republic of the Philippines", 105, 20, { align: "center" });
      doc.text("Province of Cebu", 105, 25, { align: "center" });
      doc.text("City/Municipality of Medellin", 105, 30, { align: "center" });
      doc.text("Barangay Lamintak Sur", 105, 35, { align: "center" });
      doc.text("Office of the Punong Barangay", 105, 40, { align: "center" });
      
      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BARANGAY CERTIFICATION", 105, 60, { align: "center" });
      
      // Reset font
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Main content
      doc.text("To Whom It May Concern:", 20, 80);
      
      // Paragraph with details
      const residentInfo = `This is to certify that ${documentDetails.requester_name}, ${resident?.age || "[Age]"}, ${resident?.civil_status || "[Civil Status]"}, and a resident of ${resident?.barangay || "[Complete Address]"}, Barangay Lamintak Sur, Medellin, Cebu, has been a bonafide resident of this barangay since ${resident?.yearsResidency || "[Year of Residency]"}.`;
      
      const splitResidentInfo = doc.splitTextToSize(residentInfo, 170);
      doc.text(splitResidentInfo, 20, 100);
      
      // Purpose
      const purposeText = `This certification is issued upon the request of the above-named individual for ${documentDetails?.document_type || "[Purpose of the Certificate]"}.`;
      const splitPurpose = doc.splitTextToSize(purposeText, 170);
      doc.text(splitPurpose, 20, 120);
      
      // Date issued
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      
      doc.text(`Issued this ${day} of ${month}, ${year} at Barangay Lamintak Sur, Medellin, Cebu, Philippines.`, 20, 140);
      
      // Add signature
      doc.addImage(signature, 'PNG', 20, 170, 50, 25);
      
      // Signature text
      doc.text("Certified by:", 20, 165);
      doc.setFont("helvetica", "bold");
      doc.text("Hon. Ambrosio Tahadlangit", 20, 200);
      doc.setFont("helvetica", "normal");
      doc.text("Barangay Captain", 20, 205);
      
      // Save PDF
      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      
      // Open PDF in new tab
      window.open(pdfUrl, '_blank');
      
      setSuccessMessage("PDF generated successfully!");
      return pdfOutput;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setErrorMessage("Failed to generate PDF. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to send email with PDF
  const sendEmailWithPDF = async () => {
    if (!signature) {
      setErrorMessage("Please sign the document before sending the email.");
      return;
    }
    
    setIsSending(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      // Generate PDF first
      const pdfBlob = await generatePDF();
      
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }
      
      // Create form data to send
      const formData = new FormData();
      formData.append('to', documentDetails.requester_email);
      formData.append('subject', 'Barangay Certification');
      formData.append('message', `Dear ${documentDetails.requester_name},\n\nPlease find attached your requested Barangay Certification.\n\nRegards,\nBarangay Lamintak Sur Office`);
      formData.append('attachment', pdfBlob, 'barangay_certification.pdf');
      
      // Send email using your backend API
      const response = await axios.post('https://barangayapi.vercel.app/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccessMessage("Email sent successfully!");
        
        // Update document status in your database
        await axios.put(`https://barangayapi.vercel.app/document/${documentDetails.documentId}`, {
          status: "Completed",
          email_sent: true,
          email_sent_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        
      } else {
        throw new Error(response.data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-medium">Barangay Certification Generator</h3>
      
      {successMessage && (
        <div className="p-3 rounded bg-green-50 text-green-700 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 rounded bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Barangay Captain's Signature
        </label>
        <div className="border-2 border-gray-300 rounded-md p-2 bg-gray-50">
          <canvas
            ref={canvasRef}
            className="w-full h-32 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={finishDrawing}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={clearSignature}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Trash className="mr-2 h-4 w-4" />
            Clear Signature
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={generatePDF}
          disabled={isGenerating || !signature}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-5 w-5" />
          {isGenerating ? "Generating..." : "Generate PDF"}
        </button>
        
        <button
          onClick={sendEmailWithPDF}
          disabled={isSending || !signature}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          <Mail className="mr-2 h-5 w-5" />
          {isSending ? "Sending..." : "Generate & Send Email"}
        </button>
      </div>
    </div>
  );
};

export default CertificationGenerator;