import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listVessels from "./tools/list-vessels";
import getVesselProfile from "./tools/get-vessel-profile";
import listExpiringCertificates from "./tools/list-expiring-certificates";
import listIncidents from "./tools/list-incidents";
import reportIncident from "./tools/report-incident";
import listAuditFindings from "./tools/list-audit-findings";
import fleetComplianceSummary from "./tools/fleet-compliance-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "eagle-maritime-cog-os",
  title: "Eagle-Maritime COG. OS",
  version: "0.1.0",
  instructions:
    "Tools for Eagle Maritime OS, a vessel compliance and fleet management platform. Use `fleet_compliance_summary` for a quick fleet health check, `list_vessels` and `get_vessel_profile` for vessel particulars and certificates, `list_expiring_certificates` for statutory/class certificate renewals, `list_audit_findings` for ISM/ISPS audit non-conformities, and `list_incidents` / `report_incident` for incident management. All data is scoped to the signed-in user's organization.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    fleetComplianceSummary,
    listVessels,
    getVesselProfile,
    listExpiringCertificates,
    listAuditFindings,
    listIncidents,
    reportIncident,
  ],
});
