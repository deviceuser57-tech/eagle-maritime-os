import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationQRProps {
    token: string;
    certName: string;
}

export const VerificationQR = ({ token, certName }: VerificationQRProps) => {
    const verificationUrl = `${window.location.origin}/verify?token=${token}`;

    const handleOpenLink = () => {
        window.open(verificationUrl, "_blank");
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-semibold text-sm">Digital Verification Seal</span>
            </div>

            <div className="p-2 bg-white border-4 border-slate-50 rounded-lg">
                <QRCodeSVG
                    value={verificationUrl}
                    size={160}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                        src: "/placeholder.svg",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                    }}
                />
            </div>

            <div className="text-center">
                <p className="text-xs text-slate-500 max-w-[200px] mb-4">
                    Scan to verify the authenticity of <strong>{certName}</strong> via Eagle Vessels Trust Portal.
                </p>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={handleOpenLink}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open Verification
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Verify this certificate online</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};
