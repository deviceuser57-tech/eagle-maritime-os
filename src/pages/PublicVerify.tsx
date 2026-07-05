import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Anchor, Building2, Calendar, ShieldCheck } from "lucide-react";

export default function PublicVerify() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(true);
    const [verification, setVerification] = useState<any>(null);

    useEffect(() => {
        async function verify() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await (supabase.rpc as any)("rpc_public_verify_certificate", {
                    p_token: token,
                });

                if (error) throw error;
                setVerification(data);
            } catch (err) {
                console.error("Verification error:", err);
            } finally {
                setLoading(false);
            }
        }

        verify();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                        Eagle Vessels Verification Portal
                    </h1>
                    <p className="mt-2 text-slate-600">International Maritime Certificate Verification Service</p>
                </div>

                {!token || !verification?.valid ? (
                    <Card className="border-red-100 bg-red-50 text-center py-8">
                        <CardContent>
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <CardTitle className="text-red-900 mb-2">Invalid Verification Token</CardTitle>
                            <p className="text-red-700">This certificate could not be verified. It may have expired, been revoked, or the link is incorrect.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-green-100 bg-white shadow-xl overflow-hidden">
                        <div className="h-2 bg-green-500" />
                        <CardHeader className="bg-green-50/50 border-b border-green-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 mb-2">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Authentic
                                    </Badge>
                                    <CardTitle className="text-2xl text-slate-900">{verification.details.certificate_name}</CardTitle>
                                </div>
                                <Anchor className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Anchor className="h-4 w-4" /> Vessel Name
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900">{verification.details.vessel_name || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" /> Managed By
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900">{verification.details.company}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" /> Issuing Authority
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900">{verification.details.issuing_authority || "Recorded Flag State"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Expiry Date
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900">{new Date(verification.details.expiry_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400">
                                    Verification Timestamp: {new Date(verification.details.verification_timestamp).toUTCString()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Ref: {token}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mt-8 text-center text-slate-400 text-sm">
                    &copy; 2026 Eagle Vessels Compliance Engine. All rights reserved.
                </div>
            </div>
        </div>
    );
}
