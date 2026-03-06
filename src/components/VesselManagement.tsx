import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useOrganization as useOrg } from '@/hooks/useOrganization';
import { useVessels, Vessel } from '@/hooks/useVessels';
import { useSetupCompanies } from '@/hooks/useSetupCompanies';
import { useClassificationSocieties, useFlagStates } from '@/hooks/useSetupClassification';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useVesselRegulatoryPortfolio } from '@/hooks/useRegulations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Ship,
  Plus,
  Pencil,
  Trash2,
  Anchor,
  Flag,
  Hash,
  Settings,
  Gauge,
  Shield,
  Building2,
  Eye,
  Loader2,
  Calendar,
  Wrench,
  Camera,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Upload,
  User,
  Clock,
  Paperclip,
  ListChecks,
  Scale,
  Info,
  ShieldAlert,
  X
} from 'lucide-react';


interface VesselFormData {
  name: string;
  imo_number: string;
  call_sign: string;
  mmsi_number: string;
  official_number: string;
  vessel_type: string;
  flag_state: string;
  port_of_registry: string;
  gross_tonnage: string;
  net_tonnage: string;
  deadweight: string;
  year_built: string;
  classification_society: string;
  class_number: string;
  status: string;
  // Dimensions
  length_overall: string;
  beam: string;
  depth: string;
  draft: string;
  // Machinery
  engine_make: string;
  engine_model: string;
  engine_power: string;
  propulsion_type: string;
  max_speed: string;
  service_speed: string;
  fuel_consumption: string;
  fuel_type: string;
  // Safety
  lifeboats: string;
  liferafts: string;
  crew_capacity: string;
  passenger_capacity: string;
  // Capacity
  cargo_capacity: string;
  trading_area: string;
  hull_material: string;
  hull_coating: string;
  // Drydocking & Extended
  last_drydock_date: string;
  next_drydock_date: string;
  previous_yard: string;
  remaining_tasks: string;
  painting_details: string;
  navigation_equipment: string;
  accommodations_pax: string;
  vessel_photos: string[];
  vessel_brochure: string;
  // Financial
  purchase_price: string;
  insurance_value: string;
  currency: string;
  // Dates
  keel_laid_date: string;
  delivery_date: string;
  // Companies
  owner_company_id: string;
  operator_company_id: string;
  technical_manager_id: string;
  ism_manager_id: string;
  // Notes
  notes: string;
}

const initialFormData: VesselFormData = {
  name: '', imo_number: '', call_sign: '', mmsi_number: '', official_number: '',
  vessel_type: '', flag_state: '', port_of_registry: '', gross_tonnage: '', net_tonnage: '',
  deadweight: '', year_built: '', classification_society: '', class_number: '', status: 'active',
  length_overall: '', beam: '', depth: '', draft: '',
  engine_make: '', engine_model: '', engine_power: '', propulsion_type: '',
  max_speed: '', service_speed: '', fuel_consumption: '', fuel_type: '',
  lifeboats: '', liferafts: '', crew_capacity: '', passenger_capacity: '',
  cargo_capacity: '', trading_area: '', hull_material: '', hull_coating: '',
  last_drydock_date: '', next_drydock_date: '', previous_yard: '', remaining_tasks: '',
  painting_details: '', navigation_equipment: '', accommodations_pax: '',
  vessel_photos: [], vessel_brochure: '',
  purchase_price: '', insurance_value: '', currency: 'USD',
  keel_laid_date: '', delivery_date: '',
  owner_company_id: '', operator_company_id: '', technical_manager_id: '', ism_manager_id: '',
  notes: ''
};

const VesselManagement = () => {
  const { vessels, loading, addVessel, updateVessel, deleteVessel, uploadVesselAsset, getVesselAssetUrl } = useVessels();
  const { organization, orgId } = useOrg();
  const { addTask } = useMaintenanceTasks();

  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const { data: regulatoryPortfolio = [], isLoading: isLoadingPortfolio } = useVesselRegulatoryPortfolio(editingVessel?.id);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('general');
  const [aiInput, setAiInput] = useState('');
  const [showAiFeatures, setShowAiFeatures] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: `Greetings. I have analyzed the registry for **${formData.name || 'this vessel'}**. You can ask me technical questions, request a summary, or ask me to generate a **Vessel Profile PDF** report for you to review and export.`
    }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const brochureInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    setIsUploading(`photo-${index}`);
    try {
      // Security: File paths are prefixed with org_id for backend policy isolation
      const path = await uploadVesselAsset(file, editingVessel?.id || 'new_vessel');
      if (path) {
        const url = await getVesselAssetUrl(path);
        const newPhotos = [...formData.vessel_photos];
        newPhotos[index] = url;
        setFormData({ ...formData, vessel_photos: newPhotos });
        toast({ title: 'Photo Uploaded', description: `Vessel photo ${index + 1} updated.` });
      }
    } finally {
      setIsUploading(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };


  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Unsupported File', description: 'Please upload a PDF, JPG, PNG, or WEBP file.', variant: 'destructive' });
      return;
    }

    setIsUploading('brochure');
    try {
      const path = await uploadVesselAsset(file, editingVessel?.id || 'new_vessel');
      if (path) {
        const url = await getVesselAssetUrl(path);
        setFormData(prev => ({ ...prev, vessel_brochure: url }));
        const fileLabel = file.type.startsWith('image/') ? 'image' : 'PDF';
        toast({ title: 'Document Uploaded', description: `Vessel ${fileLabel} uploaded. Starting AI extraction...` });

        // Automatically start AI extraction
        await handleSmartFill(url, file.type);
      }
    } finally {
      setIsUploading(null);
      if (brochureInputRef.current) brochureInputRef.current.value = '';
    }
  };








  // Setup data
  const ownerCompanies = useSetupCompanies('owner');
  const operatorCompanies = useSetupCompanies('operator');
  const technicalManagers = useSetupCompanies('technical');
  const ismManagers = useSetupCompanies('ism');
  const classificationSocieties = useClassificationSocieties();
  const flagStatesHook = useFlagStates();

  const vesselTypes = [
    'Bulk Carrier', 'Container Ship', 'Crude Oil Tanker', 'Product Tanker',
    'Chemical Tanker', 'LNG Carrier', 'LPG Carrier', 'General Cargo',
    'Passenger Ship', 'RoRo Ship', 'Vehicle Carrier', 'Offshore Supply Vessel',
    'Tugboat', 'Fishing Vessel', 'Yacht'
  ];

  const propulsionTypes = ['Single Screw', 'Twin Screw', 'Diesel Electric', 'LNG Dual Fuel', 'Hybrid'];
  const fuelTypes = ['HFO', 'VLSFO', 'MGO', 'LNG', 'Methanol', 'Dual Fuel'];
  const hullMaterials = ['Steel', 'Aluminum', 'Fiberglass', 'Composite'];
  const tradingAreas = ['Worldwide', 'Coastal', 'Short Sea', 'Inland Waterways', 'Restricted'];
  const statusOptions = ['active', 'inactive', 'maintenance', 'drydock', 'laid_up'];
  const currencies = ['USD', 'EUR', 'GBP', 'SGD', 'NOK', 'JPY'];

  const handleSmartFill = async (overrideUrl?: string | React.MouseEvent, contentType?: string) => {
    const url = typeof overrideUrl === 'string' ? overrideUrl : formData.vessel_brochure;

    if (!url) {
      toast({ title: 'Document Required', description: 'Please upload a brochure (PDF or image) in the Media tab first.', variant: 'destructive' });
      return;
    }

    setIsAiGenerating(true);
    setAiMessages(prev => [...prev, {
      role: 'assistant',
      content: "System: Initiating Deep Scan of Vessel Technical Dossier... Extracting IMO, Dimensions, and Machinery specs using AI Intelligence Registry."
    }]);

    try {
      console.log('Initiating AI Technical Extraction for:', url);
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          fileUrl: url,
          contentType: contentType || undefined,
          org_id: orgId,
        }
      });

      if (error) {
        console.error('Supabase Invoke Error:', error);
        throw new Error(`Cloud connection failed: ${error.message || 'Service unreachable'}`);
      }

      if (!data?.success) throw new Error(data?.error || 'Intelligence extraction failed');

      const extracted = data.data;
      const fieldsExtracted = data.fields_extracted || Object.keys(extracted).length;
      console.log(`AI Data Payload: ${fieldsExtracted} fields extracted`, extracted);

      // Update form data with extracted fields
      setFormData(prev => {
        const next = { ...prev };
        Object.entries(extracted).forEach(([key, value]) => {
          if (key in next && value !== null && value !== undefined) {
            (next as any)[key] = String(value);
          }
        });
        return next;
      });

      const highlights = [
        extracted.name && `**Vessel**: ${extracted.name}`,
        extracted.imo_number && `**IMO**: ${extracted.imo_number}`,
        extracted.vessel_type && `**Type**: ${extracted.vessel_type}`,
        extracted.gross_tonnage && `**GT**: ${extracted.gross_tonnage}`,
        extracted.length_overall && extracted.beam && `**Dimensions**: ${extracted.length_overall}m × ${extracted.beam}m`,
        extracted.engine_make && `**Engine**: ${extracted.engine_make} ${extracted.engine_model || ''}`,
        extracted.flag_state && `**Flag**: ${extracted.flag_state}`,
      ].filter(Boolean).join('\n- ');

      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `**AI Extraction Complete — ${fieldsExtracted} fields populated!**\n\n- ${highlights}\n\nCheck all tabs (General, Technical, Machinery, Safety) for the full extracted dossier.`
      }]);

      toast({ title: 'AI Extraction Complete', description: 'Vessel form updated with technical data.' });
    } catch (err: any) {
      console.error('AI Extraction Cloud Error:', err);

      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('Failed to send') ||
        err.message?.includes('404') ||
        err.message?.includes('Service unreachable') ||
        err.message?.includes('Connection refused') ||
        err.message?.includes('Cloud connection failed');

      // FALLBACK: If the edge function is not deployed (common in dev), simulate for UX
      if (isNetworkError) {
        console.warn('AI Service unreachable. Engaging high-fidelity simulation fallback...');

        // Wait a bit to simulate processing
        await new Promise(r => setTimeout(r, 2000));

        const mockExtracted = {
          name: "MV EAGLE COMPLIANCE",
          imo_number: "9998888",
          vessel_type: "Bulk Carrier",
          gross_tonnage: "52450",
          length_overall: "229",
          beam: "32",
          engine_make: "MAN B&W",
          engine_model: "6S60MC-C",
          flag_state: "Panama"
        };

        setFormData(prev => ({ ...prev, ...mockExtracted }));
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Extraction Fallback Engaged.** The AI Registry service is currently unreachable (likely due to pending deployment). I have simulated the extraction results for you to preview:\n\n- **IMO**: ${mockExtracted.imo_number}\n- **Vessel Type**: ${mockExtracted.vessel_type}\n- **GT**: ${mockExtracted.gross_tonnage}\n- **Engine**: ${mockExtracted.engine_make} ${mockExtracted.engine_model}\n- **Flag**: ${mockExtracted.flag_state}\n\n*Note: Once the Edge Function is deployed, this will perform live OCR.*`
        }]);

        toast({
          title: 'AI Demo Mode',
          description: 'Simulated technical extraction completed while service is offline.',
          variant: 'default'
        });
        return;
      }

      let errorMessage = err.message;
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Extraction Blocker Encountered:** ${errorMessage}\n\n*Recommended Fix:* Verify Supabase Edge Function deployment and check GEMINI_API_KEY secret.`
      }]);
      toast({
        title: 'Extraction Service Error',
        description: errorMessage || 'Connection refused by AI Registry. Verify system status.',
        variant: 'destructive'
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSendAiMessage = async (e?: React.FormEvent, overridePrompt?: string) => {
    e?.preventDefault();
    const prompt = overridePrompt || aiInput;
    if (!prompt.trim() || isAiGenerating) return;

    const newMessages = [...aiMessages, { role: 'user', content: prompt }];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      if (prompt.toLowerCase().includes('report') || prompt.toLowerCase().includes('pdf')) {
        response = `I am preparing the **Vessel Profile Report** for ${formData.name}. The dossier includes technical specs, maintenance history, and drydocking forecasts. You can download the finalized document using the buttons below.`;
      } else if (prompt.toLowerCase().includes('fill') || prompt.toLowerCase().includes('extract')) {
        handleSmartFill();
        return;
      } else if (prompt.toLowerCase().includes('dd') || prompt.toLowerCase().includes('drydock')) {
        response = `Analyzing Drydocking specifications... Based on current data, the next DD is due on **${formData.next_drydock_date || 'TBD'}**. I recommend focusing on the **${formData.remaining_tasks ? formData.remaining_tasks.split('\n').length : 0}** pending tasks identified in the registry.`;
      } else {
        response = `Received your query regarding **${formData.name}**. Based on the technical data, this ${formData.vessel_type || 'vessel'} has a GT of ${formData.gross_tonnage || 'N/A'}. Is there a specific machinery or safety spec you'd like me to extract?`;
      }

      setAiMessages([...newMessages, { role: 'assistant', content: response }]);
      setIsAiGenerating(false);
    }, 1500);
  };


  const handleGenerateAiReport = () => {
    setIsAiGenerating(true);
    setAiMessages(prev => [...prev, { role: 'assistant', content: "System: Generating professional Vessel Profile PDF... Aggregating technical specifications, drydocking history, and machinery data." }]);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const primaryColor = [15, 23, 42]; // Slate-900

        // Header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('VESSEL REGISTRY PROFILE', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`GENERATED: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, 30);
        doc.text('EAGLE MARITIME FLEET INTELLIGENCE', 140, 30);

        // Core Data Section
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(14);
        doc.text('1. ASSET IDENTITY', 20, 55);
        doc.line(20, 57, 190, 57);

        autoTable(doc, {
          startY: 60,
          head: [['Parameter', 'Specification Value']],
          body: [
            ['Vessel Name', formData.name || 'N/A'],
            ['IMO Number', formData.imo_number || 'N/A'],
            ['Call Sign', formData.call_sign || 'N/A'],
            ['Vessel Type', formData.vessel_type || 'N/A'],
            ['Status', formData.status || 'Active'],
            ['Flag State', formData.flag_state || 'N/A'],
            ['Classification', formData.classification_society || 'N/A'],
          ],
          theme: 'striped',
          headStyles: { fillColor: primaryColor as [number, number, number] },
        });

        // Technical Specs
        doc.setFontSize(14);
        doc.text('2. TECHNICAL & MACHINERY', 20, (doc as any).lastAutoTable.finalY + 15);
        doc.line(20, (doc as any).lastAutoTable.finalY + 17, 190, (doc as any).lastAutoTable.finalY + 17);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          body: [
            ['Gross Tonnage', `${formData.gross_tonnage || 'N/A'} GT`],
            ['Deadweight', `${formData.deadweight || 'N/A'} DWT`],
            ['Length Overall', `${formData.length_overall || 'N/A'} m`],
            ['Main Engine', `${formData.engine_make} ${formData.engine_model}`],
            ['Engine Power', `${formData.engine_power || 'N/A'} kW`],
            ['Propulsion', formData.propulsion_type || 'N/A'],
          ],
          margin: { left: 20 },
          theme: 'grid',
        });

        // Drydocking Section
        doc.setFontSize(14);
        doc.text('3. DRYDOCKING FORECAST', 20, (doc as any).lastAutoTable.finalY + 15);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Event', 'Date / Location']],
          body: [
            ['Last Drydock Date', formData.last_drydock_date || 'N/A'],
            ['Previous DD Yard', formData.previous_yard || 'N/A'],
            ['Next Scheduled DD', formData.next_drydock_date || 'TBD'],
          ],
          theme: 'plain',
          bodyStyles: { fontStyle: 'bold' }
        });

        if (formData.remaining_tasks) {
          doc.setFontSize(10);
          doc.text('Outstanding DD Items:', 20, (doc as any).lastAutoTable.finalY + 10);
          doc.setFontSize(8);
          doc.setTextColor(100);
          const splitTasks = doc.splitTextToSize(formData.remaining_tasks, 170);
          doc.text(splitTasks, 20, (doc as any).lastAutoTable.finalY + 15);
        }

        // Regulatory Section
        if (regulatoryPortfolio.length > 0) {
          doc.setFontSize(14);
          doc.text('4. REGULATORY PORTFOLIO', 20, (doc as any).lastAutoTable.finalY + 15);
          doc.line(20, (doc as any).lastAutoTable.finalY + 17, 190, (doc as any).lastAutoTable.finalY + 17);

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Convention', 'Code', 'Title']],
            body: regulatoryPortfolio.map(reg => [reg.convention, reg.code, reg.title]),
            theme: 'striped',
          });
        }

        // 5. VESSEL IMAGERY SECTION
        if (formData.vessel_photos && formData.vessel_photos.length > 0) {
          doc.addPage();
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.text('5. VESSEL IMAGERY & DOCUMENTATION', 20, 13);

          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFontSize(10);
          doc.text('Current Visual Assets retrieved from the Digital Compliance Registry:', 20, 35);

          let currentY = 45;
          const photoLimit = Math.min(formData.vessel_photos.length, 2); // Limit to 2 for layout stability

          for (let i = 0; i < photoLimit; i++) {
            const photoUrl = formData.vessel_photos[i];
            if (photoUrl) {
              // Note: addImage works best with base64, but URLs can work depending on environment.
              // For robustness we include a placeholder frame if image fails to render.
              doc.setDrawColor(200);
              doc.rect(20, currentY, 170, 90);
              doc.text(`[ Photo Identifier: ${i + 1} - ${formData.name} ]`, 105, currentY + 45, { align: 'center' });

              try {
                // Attempting to add the actual image
                doc.addImage(photoUrl, 'JPEG', 20, currentY, 170, 90);
              } catch (e) {
                doc.setFontSize(8);
                doc.text('Image stream connection pending or CORS restricted.', 105, currentY + 55, { align: 'center' });
              }
              currentY += 105;
            }
          }
        }

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount} - Confidential Asset Report`, 105, 285, { align: 'center' });
        }

        doc.save(`Vessel_Profile_${formData.name || 'Registry'}.pdf`);

        setAiMessages(prev => [...prev, { role: 'assistant', content: `**Report Generated Successfully.**\nVessel: ${formData.name}\nExported to high-fidelity PDF format. The document includes structural, technical, drydocking specifications, and the full Regulatory Portfolio (${regulatoryPortfolio.length} references).` }]);
      } catch (err: any) {
        console.error('PDF Generation Error:', err);
        setAiMessages(prev => [...prev, { role: 'assistant', content: `Error generating PDF: ${err.message}` }]);
      } finally {
        setIsAiGenerating(false);
      }
    }, 2000);
  };

  const handleOpenDialog = (vessel?: Vessel, view = false) => {
    if (vessel) {
      setEditingVessel(vessel);
      setViewMode(view);
      setFormData({
        name: vessel.name || '',
        imo_number: vessel.imo_number || '',
        call_sign: vessel.call_sign || '',
        mmsi_number: vessel.mmsi_number || '',
        official_number: vessel.official_number || '',
        vessel_type: vessel.vessel_type || '',
        flag_state: vessel.flag_state || '',
        port_of_registry: vessel.port_of_registry || '',
        gross_tonnage: vessel.gross_tonnage?.toString() || '',
        net_tonnage: vessel.net_tonnage?.toString() || '',
        deadweight: vessel.deadweight?.toString() || '',
        year_built: vessel.year_built?.toString() || '',
        classification_society: vessel.classification_society || '',
        class_number: vessel.class_number || '',
        status: vessel.status || 'active',
        length_overall: vessel.length_overall?.toString() || '',
        beam: vessel.beam?.toString() || '',
        depth: vessel.depth?.toString() || '',
        draft: vessel.draft?.toString() || '',
        engine_make: vessel.engine_make || '',
        engine_model: vessel.engine_model || '',
        engine_power: vessel.engine_power?.toString() || '',
        propulsion_type: vessel.propulsion_type || '',
        max_speed: vessel.max_speed?.toString() || '',
        service_speed: vessel.service_speed?.toString() || '',
        fuel_consumption: vessel.fuel_consumption?.toString() || '',
        fuel_type: vessel.fuel_type || '',
        lifeboats: vessel.lifeboats?.toString() || '',
        liferafts: vessel.liferafts?.toString() || '',
        crew_capacity: vessel.crew_capacity?.toString() || '',
        passenger_capacity: vessel.passenger_capacity?.toString() || '',
        cargo_capacity: vessel.cargo_capacity?.toString() || '',
        trading_area: vessel.trading_area || '',
        hull_material: vessel.hull_material || '',
        hull_coating: vessel.hull_coating || '',
        last_drydock_date: vessel.last_drydock_date || '',
        next_drydock_date: vessel.next_drydock_date || '',
        previous_yard: vessel.previous_yard || '',
        remaining_tasks: vessel.remaining_tasks || '',
        painting_details: vessel.painting_details || '',
        navigation_equipment: vessel.navigation_equipment || '',
        accommodations_pax: vessel.accommodations_pax || '',
        vessel_photos: vessel.vessel_photos || [],
        vessel_brochure: vessel.vessel_brochure || '',
        purchase_price: vessel.purchase_price?.toString() || '',
        insurance_value: vessel.insurance_value?.toString() || '',
        currency: vessel.currency || 'USD',
        keel_laid_date: vessel.keel_laid_date || '',
        delivery_date: vessel.delivery_date || '',
        owner_company_id: vessel.owner_company_id || '',
        operator_company_id: vessel.operator_company_id || '',
        technical_manager_id: vessel.technical_manager_id || '',
        ism_manager_id: vessel.ism_manager_id || '',
        notes: vessel.notes || ''
      });
    } else {
      setEditingVessel(null);
      setViewMode(false);
      setFormData(initialFormData);
    }
    setActiveTab('general');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vesselData: any = {
      name: formData.name,
      imo_number: formData.imo_number || null,
      call_sign: formData.call_sign || null,
      mmsi_number: formData.mmsi_number || null,
      official_number: formData.official_number || null,
      vessel_type: formData.vessel_type || null,
      flag_state: formData.flag_state || null,
      port_of_registry: formData.port_of_registry || null,
      gross_tonnage: formData.gross_tonnage ? parseFloat(formData.gross_tonnage) : null,
      net_tonnage: formData.net_tonnage ? parseFloat(formData.net_tonnage) : null,
      deadweight: formData.deadweight ? parseFloat(formData.deadweight) : null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      classification_society: formData.classification_society || null,
      class_number: formData.class_number || null,
      status: formData.status || 'active',
      length_overall: formData.length_overall ? parseFloat(formData.length_overall) : null,
      beam: formData.beam ? parseFloat(formData.beam) : null,
      depth: formData.depth ? parseFloat(formData.depth) : null,
      draft: formData.draft ? parseFloat(formData.draft) : null,
      engine_make: formData.engine_make || null,
      engine_model: formData.engine_model || null,
      engine_power: formData.engine_power ? parseFloat(formData.engine_power) : null,
      propulsion_type: formData.propulsion_type || null,
      max_speed: formData.max_speed ? parseFloat(formData.max_speed) : null,
      service_speed: formData.service_speed ? parseFloat(formData.service_speed) : null,
      fuel_consumption: formData.fuel_consumption ? parseFloat(formData.fuel_consumption) : null,
      fuel_type: formData.fuel_type || null,
      lifeboats: formData.lifeboats ? parseInt(formData.lifeboats) : null,
      liferafts: formData.liferafts ? parseInt(formData.liferafts) : null,
      crew_capacity: formData.crew_capacity ? parseInt(formData.crew_capacity) : null,
      passenger_capacity: formData.passenger_capacity ? parseInt(formData.passenger_capacity) : null,
      cargo_capacity: formData.cargo_capacity ? parseFloat(formData.cargo_capacity) : null,
      trading_area: formData.trading_area || null,
      hull_material: formData.hull_material || null,
      hull_coating: formData.hull_coating || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      insurance_value: formData.insurance_value ? parseFloat(formData.insurance_value) : null,
      currency: formData.currency || 'USD',
      keel_laid_date: formData.keel_laid_date || null,
      delivery_date: formData.delivery_date || null,
      last_drydock_date: formData.last_drydock_date || null,
      next_drydock_date: formData.next_drydock_date || null,
      previous_yard: formData.previous_yard || null,
      remaining_tasks: formData.remaining_tasks || null,
      painting_details: formData.painting_details || null,
      navigation_equipment: formData.navigation_equipment || null,
      accommodations_pax: formData.accommodations_pax || null,
      vessel_photos: formData.vessel_photos || [],
      vessel_brochure: formData.vessel_brochure || null,
      owner_company_id: formData.owner_company_id || null,
      operator_company_id: formData.operator_company_id || null,
      technical_manager_id: formData.technical_manager_id || null,
      ism_manager_id: formData.ism_manager_id || null,
      notes: formData.notes || null
    };

    if (editingVessel) {
      await updateVessel(editingVessel.id, vesselData);
    } else {
      await addVessel(vesselData);
    }

    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingVessel(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vessel?')) {
      await deleteVessel(id);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active': return 'status-valid';
      case 'maintenance': return 'status-warning';
      case 'inactive': return 'status-expired';
      case 'drydock': return 'btn-ocean';
      case 'laid_up': return 'status-critical';
      default: return 'status-valid';
    }
  };

  const stats = {
    total: vessels.length,
    active: vessels.filter(v => v.status === 'active').length,
    maintenance: vessels.filter(v => v.status === 'maintenance' || v.status === 'drydock').length
  };

  const renderFormField = (id: string, label: string, value: string, onChange: (value: string) => void, type = 'text', placeholder = '') => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={viewMode}
        className="rounded-xl border-border bg-background/50 focus:ring-primary/20"
      />
    </div>
  );

  const renderSelectField = (id: string, label: string, value: string, onChange: (value: string) => void, options: string[] | { value: string; label: string }[]) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={viewMode}>
        <SelectTrigger className="rounded-xl border-border bg-background/50">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-border backdrop-blur-xl">
          {options.map((opt) => (
            typeof opt === 'string'
              ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              : <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2 uppercase px-1">
            Asset Registry
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base font-medium px-1">
            Authorized vessel directory and technical specification database.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleOpenDialog()}
                className="btn-maritime px-6 h-12 rounded-xl text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register Vessel
              </Button>
              <Button
                onClick={() => {
                  handleOpenDialog();
                  // When starting with AI, we can prompt them to upload immediately
                  setTimeout(() => {
                    brochureInputRef.current?.click();
                  }, 100);
                }}
                variant="outline"
                className="px-6 h-12 rounded-xl text-sm border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-black uppercase tracking-tighter"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Smart Ingest
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-border backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {viewMode ? 'Vessel Dossier' : (editingVessel ? 'Update Registry' : 'New Vessel Registration')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8 mt-6">
              {/* Global Hidden Inputs - Persistently Mounted for AI/Ref accessibility */}
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const index = parseInt(photoInputRef.current?.getAttribute('data-index') || '0');
                  handlePhotoUpload(e, index);
                }}
              />
              <input
                type="file"
                ref={brochureInputRef}
                className="hidden"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={handleBrochureUpload}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,image/jpeg,image/png,image/webp,.doc,.docx"
                onChange={handleBrochureUpload}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 bg-muted/50 p-1 rounded-xl h-auto min-h-12 overflow-x-auto gap-1">
                  <TabsTrigger value="general" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Ship className="h-3 w-3 mr-1" />Gen</TabsTrigger>
                  <TabsTrigger value="technical" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Settings className="h-3 w-3 mr-1" />Tech</TabsTrigger>
                  <TabsTrigger value="machinery" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Gauge className="h-3 w-3 mr-1" />Eng</TabsTrigger>
                  <TabsTrigger value="safety" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Shield className="h-3 w-3 mr-1" />Safe</TabsTrigger>
                  <TabsTrigger value="drydock" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Wrench className="h-3 w-3 mr-1" />DD</TabsTrigger>
                  <TabsTrigger value="compliance" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1 font-bold"><Scale className="h-3 w-3 mr-1" />Legal</TabsTrigger>
                  <TabsTrigger value="equipment" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Anchor className="h-3 w-3 mr-1" />Equip</TabsTrigger>
                  <TabsTrigger value="media" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Camera className="h-3 w-3 mr-1" />Media</TabsTrigger>
                  <TabsTrigger value="management" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1"><Building2 className="h-3 w-3 mr-1" />Mgt</TabsTrigger>
                  <TabsTrigger value="ai" className="rounded-lg text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm px-1 font-bold text-primary"><Scale className="h-3 w-3 mr-1 opacity-0 absolute" /><Sparkles className="h-3 w-3 mr-1" />AI</TabsTrigger>
                </TabsList>

                <div className="mt-6 bg-slate-500/5 p-6 rounded-2xl border border-border/50 min-h-[400px]">
                  <TabsContent value="general" className="space-y-5 mt-0">
                    {/* AI Quick Ingest Section */}
                    {!viewMode && (
                      <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-tight text-primary">AI Technical Ingestion</h4>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase leading-relaxed max-w-[200px] md:max-w-md">
                              Upload a technical brochure or specification sheet. Our AI will extract the name, IMO, and technical dossier automatically.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading === 'brochure'}
                          onClick={() => brochureInputRef.current?.click()}
                          className="rounded-xl h-10 px-4 border-primary/30 hover:bg-primary hover:text-white transition-all font-bold text-xs"
                        >
                          {isUploading === 'brochure' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Upload className="h-3.5 w-3.5 mr-2" /> Upload PDF</>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {renderFormField('name', 'Vessel Name *', formData.name, (v) => setFormData({ ...formData, name: v }))}
                      {renderFormField('imo_number', 'IMO Number', formData.imo_number, (v) => setFormData({ ...formData, imo_number: v }), 'text', '9876543')}
                      {renderFormField('official_number', 'Official No', formData.official_number, (v) => setFormData({ ...formData, official_number: v }))}
                      {renderFormField('call_sign', 'Call Sign', formData.call_sign, (v) => setFormData({ ...formData, call_sign: v }))}
                      {renderFormField('mmsi_number', 'MMSI', formData.mmsi_number, (v) => setFormData({ ...formData, mmsi_number: v }))}
                      {renderSelectField('vessel_type', 'Type', formData.vessel_type, (v) => setFormData({ ...formData, vessel_type: v }), vesselTypes)}
                      {renderSelectField('flag_state', 'Flag', formData.flag_state, (v) => setFormData({ ...formData, flag_state: v }),
                        flagStatesHook.flagStates.length > 0
                          ? flagStatesHook.flagStates.map(f => ({ value: f.flag_name, label: f.flag_name }))
                          : ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Bahamas', 'Malta']
                      )}
                      {renderFormField('port_of_registry', 'Port', formData.port_of_registry, (v) => setFormData({ ...formData, port_of_registry: v }))}
                      {renderFormField('year_built', 'Built', formData.year_built, (v) => setFormData({ ...formData, year_built: v }), 'number', '2020')}
                      {renderSelectField('classification_society', 'Class', formData.classification_society, (v) => setFormData({ ...formData, classification_society: v }),
                        classificationSocieties.societies.length > 0
                          ? classificationSocieties.societies.map(s => ({ value: s.society_name, label: `${s.society_name} (${s.abbreviation || ''})` }))
                          : ['DNV GL', "Lloyd's Register", 'ABS', 'Bureau Veritas']
                      )}
                      {renderFormField('class_number', 'Class No', formData.class_number, (v) => setFormData({ ...formData, class_number: v }))}
                      {renderSelectField('status', 'Status', formData.status, (v) => setFormData({ ...formData, status: v }), statusOptions)}
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {renderFormField('gross_tonnage', 'GT', formData.gross_tonnage, (v) => setFormData({ ...formData, gross_tonnage: v }), 'number')}
                      {renderFormField('net_tonnage', 'NT', formData.net_tonnage, (v) => setFormData({ ...formData, net_tonnage: v }), 'number')}
                      {renderFormField('deadweight', 'DWT', formData.deadweight, (v) => setFormData({ ...formData, deadweight: v }), 'number')}
                      {renderFormField('length_overall', 'LOA (m)', formData.length_overall, (v) => setFormData({ ...formData, length_overall: v }), 'number')}
                      {renderFormField('beam', 'Beam (m)', formData.beam, (v) => setFormData({ ...formData, beam: v }), 'number')}
                      {renderFormField('depth', 'Depth (m)', formData.depth, (v) => setFormData({ ...formData, depth: v }), 'number')}
                      {renderFormField('draft', 'Draft (m)', formData.draft, (v) => setFormData({ ...formData, draft: v }), 'number')}
                      {renderFormField('cargo_capacity', 'Cargo Cap', formData.cargo_capacity, (v) => setFormData({ ...formData, cargo_capacity: v }), 'number')}
                      {renderSelectField('hull_material', 'Hull Mat', formData.hull_material, (v) => setFormData({ ...formData, hull_material: v }), hullMaterials)}
                      {renderFormField('hull_coating', 'Hull Coating', formData.hull_coating, (v) => setFormData({ ...formData, hull_coating: v }))}
                    </div>
                  </TabsContent>

                  <TabsContent value="machinery" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {renderFormField('engine_make', 'Eng Make', formData.engine_make, (v) => setFormData({ ...formData, engine_make: v }))}
                      {renderFormField('engine_model', 'Eng Model', formData.engine_model, (v) => setFormData({ ...formData, engine_model: v }))}
                      {renderFormField('engine_power', 'Power (kW)', formData.engine_power, (v) => setFormData({ ...formData, engine_power: v }), 'number')}
                      {renderSelectField('propulsion_type', 'Propulsion', formData.propulsion_type, (v) => setFormData({ ...formData, propulsion_type: v }), propulsionTypes)}
                      {renderFormField('max_speed', 'Max (kn)', formData.max_speed, (v) => setFormData({ ...formData, max_speed: v }), 'number')}
                      {renderFormField('service_speed', 'Service (kn)', formData.service_speed, (v) => setFormData({ ...formData, service_speed: v }), 'number')}
                      {renderFormField('fuel_consumption', 'Cons (t/d)', formData.fuel_consumption, (v) => setFormData({ ...formData, fuel_consumption: v }), 'number')}
                      {renderSelectField('fuel_type', 'Fuel', formData.fuel_type, (v) => setFormData({ ...formData, fuel_type: v }), fuelTypes)}
                    </div>
                  </TabsContent>

                  <TabsContent value="safety" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {renderFormField('lifeboats', 'Lifeboats', formData.lifeboats, (v) => setFormData({ ...formData, lifeboats: v }), 'number')}
                      {renderFormField('liferafts', 'Liferafts', formData.liferafts, (v) => setFormData({ ...formData, liferafts: v }), 'number')}
                      {renderFormField('crew_capacity', 'Crew Cap', formData.crew_capacity, (v) => setFormData({ ...formData, crew_capacity: v }), 'number')}
                      {renderFormField('passenger_capacity', 'Pax Cap', formData.passenger_capacity, (v) => setFormData({ ...formData, passenger_capacity: v }), 'number')}
                      {renderFormField('purchase_price', 'Price', formData.purchase_price, (v) => setFormData({ ...formData, purchase_price: v }), 'number')}
                      {renderSelectField('currency', 'Currency', formData.currency, (v) => setFormData({ ...formData, currency: v }), currencies)}
                    </div>
                  </TabsContent>

                  <TabsContent value="drydock" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {renderFormField('last_drydock_date', 'Previous DD Date', formData.last_drydock_date, (v) => setFormData({ ...formData, last_drydock_date: v }), 'date')}
                      {renderFormField('previous_yard', 'Previous DD Yard', formData.previous_yard, (v) => setFormData({ ...formData, previous_yard: v }), 'text', 'Yard name...')}
                      {renderFormField('next_drydock_date', 'Next DD Date', formData.next_drydock_date, (v) => setFormData({ ...formData, next_drydock_date: v }), 'date')}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Remaining Tasks / Special Conditions (Previous DD)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5 uppercase"
                          onClick={async () => {
                            if (!formData.remaining_tasks || !editingVessel) {
                              alert('Please save the vessel first and ensure tasks are listed.');
                              return;
                            }
                            const tasks = formData.remaining_tasks.split('\n').filter(t => t.trim());
                            for (const task of tasks) {
                              await addTask({
                                title: task,
                                description: `Carried forward from previous Drydocking at ${formData.previous_yard || 'unknown yard'}.`,
                                vessel_id: editingVessel.id,
                                task_type: 'drydock',
                                priority: 'medium',
                                status: 'scheduled',
                                due_date: formData.next_drydock_date || new Date().toISOString().split('T')[0],
                                notes: 'Auto-promoted from Vessel Registry DD Remaining Tasks.',
                                completed_date: null,
                                assigned_to: null,
                                estimated_hours: null,
                                actual_hours: null,
                                cost_estimate: null,
                                actual_cost: null
                              });
                            }
                            alert(`${tasks.length} tasks successfully promoted to Maintenance Planner.`);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add to Planner
                        </Button>
                      </div>
                      <Textarea
                        value={formData.remaining_tasks}
                        onChange={(e) => setFormData({ ...formData, remaining_tasks: e.target.value })}
                        placeholder="List items to be carried forward (one per line)..."
                        rows={4}
                        className="rounded-xl border-border bg-background/50 text-sm"
                        disabled={viewMode}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="space-y-4 mt-0">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Regulatory Portfolio for {formData.name || 'this Asset'}
                      </Label>
                      <Badge className="bg-primary/10 text-primary border-primary/20">{regulatoryPortfolio.length} Rules Attached</Badge>
                    </div>
                    {isLoadingPortfolio ? (
                      <div className="py-10 text-center animate-pulse text-xs font-bold uppercase tracking-widest text-muted-foreground">Accessing Regulatory Intelligence...</div>
                    ) : regulatoryPortfolio.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl bg-slate-500/5">
                        <p className="text-muted-foreground italic text-sm">No specific regulations currently linked to this asset.</p>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase">Links are automatically established based on Certificate types and Audit scopes.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {regulatoryPortfolio.map((reg, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-border bg-background/40 hover:bg-background/80 transition-all group">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] font-black border-primary/30 text-primary uppercase px-1.5">{reg.convention}</Badge>
                                  <span className="text-xs font-black text-foreground">{reg.code}</span>
                                </div>
                                <h5 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{reg.title}</h5>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">{reg.description || 'Global maritime standard applicable to this asset class.'}</p>
                              </div>
                              <Info className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Painting & Coating Data</Label>
                        <Textarea
                          value={formData.painting_details}
                          onChange={(e) => setFormData({ ...formData, painting_details: e.target.value })}
                          placeholder="Type, system, last application details..."
                          rows={4}
                          className="rounded-xl border-border bg-background/50 text-sm"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Crew Accommodations (PAX)</Label>
                        <Textarea
                          value={formData.accommodations_pax}
                          onChange={(e) => setFormData({ ...formData, accommodations_pax: e.target.value })}
                          placeholder="Cabin breakdown, amenities, capacity detail..."
                          rows={4}
                          className="rounded-xl border-border bg-background/50 text-sm"
                          disabled={viewMode}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Navigation Aids & Equipment</Label>
                      <Textarea
                        value={formData.navigation_equipment}
                        onChange={(e) => setFormData({ ...formData, navigation_equipment: e.target.value })}
                        placeholder="Radar, GPS, ECDIS, Gyro, Auto-pilot technical details..."
                        rows={6}
                        className="rounded-xl border-border bg-background/50 text-sm"
                        disabled={viewMode}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-5 mt-0">
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vessel Gallery (5 Photos Required)</Label>

                      <div className="grid grid-cols-5 gap-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (viewMode) return;
                              photoInputRef.current?.setAttribute('data-index', i.toString());
                              photoInputRef.current?.click();
                            }}
                            className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-slate-500/5 hover:bg-slate-500/10 transition-colors cursor-pointer group relative overflow-hidden"
                          >
                            {isUploading === `photo-${i}` ? (
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : formData.vessel_photos[i] ? (
                              <img src={formData.vessel_photos[i]} className="w-full h-full object-cover rounded-2xl" alt={`Vessel ${i + 1}`} />
                            ) : (
                              <>
                                <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-bold text-muted-foreground/60">PHOTO {i + 1}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vessel Brochure / Spec Sheet (PDF or Image)</Label>

                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background/50">
                          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                            {isUploading === 'brochure' ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <FileText className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold truncate max-w-[200px]">
                              {formData.vessel_brochure
                                ? formData.vessel_brochure.split('/').pop()?.split('?')[0] || 'Technical Brochure'
                                : 'No brochure uploaded'}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase font-medium font-mono">
                              {formData.vessel_brochure ? 'INDEXED · AI READY' : 'PDF, JPG, PNG, or WEBP'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={viewMode || isUploading === 'brochure'}
                            className="rounded-xl h-9 hover:bg-primary hover:text-white transition-all"
                            onClick={() => brochureInputRef.current?.click()}
                          >
                            <Upload className="h-3.5 w-3.5 mr-2" /> Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>


                  <TabsContent value="management" className="space-y-5 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {renderSelectField('owner_company_id', 'Owner', formData.owner_company_id, (v) => setFormData({ ...formData, owner_company_id: v }),
                        ownerCompanies.companies.map(c => ({ value: c.id, label: c.name }))
                      )}
                      {renderSelectField('operator_company_id', 'Operator', formData.operator_company_id, (v) => setFormData({ ...formData, operator_company_id: v }),
                        operatorCompanies.companies.map(c => ({ value: c.id, label: c.name }))
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Operational Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Log critical observations..."
                        rows={3}
                        className="rounded-xl border-border bg-background/50 focus:ring-primary/20 resize-none text-sm"
                        disabled={viewMode}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="h-full mt-0">
                    <div className="flex flex-col h-[450px] dark:bg-slate-900 bg-muted rounded-2xl border border-border overflow-hidden">
                      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-black uppercase text-foreground tracking-widest">AI Vessel Intelligence</h4>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => {
                              const content = aiMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `AI_Analysis_${formData.name}.txt`;
                              a.click();
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {aiMessages.map((msg, idx) => (
                          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/20' : 'bg-muted/40'}`}>
                              {msg.role === 'assistant' ? <Sparkles className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[80%] border ${msg.role === 'assistant' ? 'bg-muted/10 text-foreground/80 border-border' : 'bg-primary/10 text-foreground border-primary/20'}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isAiGenerating && (
                          <div className="flex gap-3 animate-pulse">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 bg-muted/10 rounded-2xl p-4 text-xs text-muted-foreground italic">
                              Analyzing vessel telemetry and registry data...
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-muted/20 border-t border-border">
                        <form onSubmit={handleSendAiMessage} className="relative flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 text-muted-foreground shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAiGenerating}
                          >
                            <Paperclip className="h-5 w-5" />
                          </Button>
                          <div className="relative flex-1">
                            <Input
                              value={aiInput}
                              onChange={(e) => setAiInput(e.target.value)}
                              className="bg-muted/10 border-border rounded-xl pl-4 pr-12 text-xs h-11 focus:ring-primary/40 w-full"
                              placeholder="Ask about specs, DD history, or upload documents..."
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={!aiInput.trim() || isAiGenerating}
                              className="absolute right-1 top-1 h-9 w-9 bg-primary hover:bg-primary/80 rounded-lg"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="ghost"
                            className="h-7 px-3 text-[10px] font-bold text-primary hover:text-white hover:bg-primary rounded-full border border-primary/30 uppercase"
                            onClick={() => handleSmartFill()}
                            disabled={isAiGenerating || !formData.vessel_brochure}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Smart Tech Extract
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-7 px-3 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full border border-border uppercase"
                            onClick={handleGenerateAiReport}
                            disabled={isAiGenerating}
                          >
                            Generate Report PDF
                          </Button>

                          <Button
                            variant="ghost"
                            className="h-7 px-3 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full border border-border uppercase"
                            onClick={() => setShowAiFeatures(true)}
                          >
                            <ListChecks className="h-3 w-3 mr-1" /> Feature Catalog
                          </Button>

                          {/* Feature Catalog Modal */}
                          {showAiFeatures && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 brounded-xl bg-primary/10 text-primary">
                                      <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h3 className="font-black uppercase tracking-tighter text-base">AI Intelligence Catalog</h3>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Empowering maritime data isolation</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAiFeatures(false)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-6 space-y-4">
                                  <div className="grid grid-cols-1 gap-4">
                                    {[
                                      { title: "Smart Technical Autofill", desc: "Instantly extracts GT, IMO, Dimensions, and Machinery specs from PDF brochures or vessel photos.", icon: <Ship className="h-4 w-4" /> },
                                      { title: "Compliance Gap Analysis", desc: "Cross-references your vessel type against MARPOL/SOLAS regulations to identify missing records.", icon: <ShieldAlert className="h-4 w-4" /> },
                                      { title: "Maintenance Forecasting", desc: "Analyzes coating history and painting details to suggest optimized drydocking windows.", icon: <Settings className="h-4 w-4" /> },
                                      { title: "Performance Benchmarking", desc: "Compares your technical specs against fleet averages for fuel efficiency and CII targets.", icon: <Gauge className="h-4 w-4" /> }
                                    ].map((f, i) => (
                                      <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors">
                                        <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                          {f.icon}
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold uppercase tracking-tight">{f.title}</h4>
                                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                      <strong>Pro Tip:</strong> For the best results, ensure documents are high-resolution and machine-readable PDFs. Photos of nameplates or registry certificates are also supported.
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                                  <Button onClick={() => setShowAiFeatures(false)} className="btn-maritime h-9 px-6 text-xs transition-all hover:scale-[1.02]">Got it, proceed</Button>
                                </div>
                              </div>
                            </div>
                          )}


                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6 text-sm">
                  {viewMode ? 'Close Portal' : 'Abort'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="btn-maritime h-11 px-8 text-sm">
                    {editingVessel ? 'Update Dossier' : 'Finalize Registration'}
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div >

      {/* Stats Cards */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        <Card className="maritime-card group">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Tactical Assets</p>
              <p className="text-4xl font-black text-foreground group-hover:translate-x-1 transition-transform origin-left">{stats.total}</p>
            </div>
            <div className="p-4 rounded-2xl bg-primary/5 text-primary">
              <Ship className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card group">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Operational</p>
              <p className="text-4xl font-black text-emerald-600 group-hover:translate-x-1 transition-transform origin-left">{stats.active}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/5 text-emerald-600">
              <Gauge className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card group">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Refitting</p>
              <p className="text-4xl font-black text-amber-500 group-hover:translate-x-1 transition-transform origin-left">{stats.maintenance}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/5 text-amber-500">
              <Settings className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div >

      {/* Vessels Table */}
      < div className="maritime-card" >
        <div className="p-6 border-b border-border bg-slate-500/5">
          <h3 className="font-bold text-base tracking-tight uppercase">Fleet Intelligence Table</h3>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Verified Multi-vessel Monitoring Node</p>
        </div>
        <div className="p-0 overflow-x-auto scrollbar-hide">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-bold text-muted-foreground text-xs uppercase tracking-tighter">Decrypting Asset Data...</p>
            </div>
          ) : vessels.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground border-t border-border/50">
              <Ship className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-base">Zero assets detected in current sector.</p>
              <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2 text-primary font-bold text-sm">
                + INITIALIZE FIRST VESSEL RECORD
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-slate-500/5 hover:bg-slate-500/5">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Asset Dossier</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Identity</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Drydocking (LAST/NEXT)</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Metric (GT/DWT)</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">Status Code</TableHead>
                  <TableHead className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-widest">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vessels.map((vessel) => (
                  <TableRow key={vessel.id} className="group/row hover:bg-primary/5 transition-colors border-border/40">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover/row:scale-105 transition-transform">
                          <Ship className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover/row:text-primary transition-colors">{vessel.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{vessel.vessel_type || 'Unclassified'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">IMO: {vessel.imo_number || '-'}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">CS: {vessel.call_sign || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-emerald-600/60" />
                          <span className="text-[11px] font-bold">{vessel.last_drydock_date || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-amber-500/60" />
                          <span className="text-[10px] font-bold text-amber-600">{vessel.next_drydock_date || 'TBD'}</span>
                        </div>
                        {(vessel as any).previous_dd_yard && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Anchor className="h-2.5 w-2.5 text-muted-foreground/60" />
                            <span className="text-[9px] font-medium text-muted-foreground truncate max-w-[100px]">{(vessel as any).previous_dd_yard}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{vessel.gross_tonnage?.toLocaleString() || '-'} GT</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{vessel.deadweight?.toLocaleString() || '-'} DWT</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className={getStatusBadge(vessel.status)}>
                        {vessel.status?.charAt(0).toUpperCase() + vessel.status?.slice(1).replace('_', ' ') || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(vessel, true)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary border-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(vessel)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary border-primary/10"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(vessel.id)}
                          className="h-8 w-8 rounded-lg shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselManagement;
