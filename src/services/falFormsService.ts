import { supabase } from "@/integrations/supabase/client";

export interface FALForm1Data {
    imo_number: string;
    mmsi_number: string;
    call_sign: string;
    flag_state: string;
    vessel_type: string;
    arrival_port: string;
    departure_port: string;
    arrival_date: string;
    crew_count: number;
    passenger_count: number;
}

export interface FALForm5Member {
    first_name: string;
    last_name: string;
    rank: string;
    nationality: string;
    passport_number: string;
}

export const falFormsService = {
    /**
     * Generates data for IMO FAL Form 1 (General Declaration)
     */
    async generateForm1(vesselId: string): Promise<FALForm1Data | null> {
        const { data: vessel, error } = await supabase
            .from('vessels')
            .select('*')
            .eq('id', vesselId)
            .single();

        if (error || !vessel) return null;

        // Fetch latest crew count
        const { count: crewCount } = await supabase
            .from('crew_members')
            .select('*', { count: 'exact', head: true })
            .eq('vessel_id', vesselId);

        return {
            imo_number: (vessel as any).imo_number || 'N/A',
            mmsi_number: (vessel as any).mmsi_number || 'N/A',
            call_sign: (vessel as any).call_sign || 'N/A',
            flag_state: (vessel as any).flag_state || 'N/A',
            vessel_type: (vessel as any).vessel_type || 'N/A',
            arrival_port: 'TO BE SPECIFIED',
            departure_port: 'TO BE SPECIFIED',
            arrival_date: new Date().toISOString(),
            crew_count: crewCount || 0,
            passenger_count: 0
        };
    },

    /**
     * Generates data for IMO FAL Form 5 (Crew List)
     */
    async generateForm5(vesselId: string): Promise<FALForm5Member[]> {
        const { data, error } = await supabase
            .from('crew_members')
            .select('first_name, last_name, rank, nationality, certificate_number')
            .eq('vessel_id', vesselId);

        if (error) return [];

        return (data || []).map(m => ({
            first_name: m.first_name,
            last_name: m.last_name,
            rank: m.rank,
            nationality: m.nationality || 'Unknown',
            passport_number: m.certificate_number || 'N/A'
        }));
    },

    /**
     * Exports form data to standardized XML (planned)
     */
    exportToXML(formData: any, formType: string): string {
        // Basic structure for port authorities' EDI systems
        const timestamp = new Date().toISOString();
        return `<?xml version="1.0" encoding="UTF-8"?>
<IMO_FAL_Form type="${formType}" generated="${timestamp}">
  ${Object.entries(formData).map(([key, value]) => `<${key}>${value}</${key}>`).join('\n  ')}
</IMO_FAL_Form>`;
    }
};
