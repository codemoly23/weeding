"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  CreditCard,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { services } from "@/lib/data/services";
import { states } from "@/lib/data/states";

const steps = [
  { id: 1, name: "Service", icon: Building2 },
  { id: 2, name: "Details", icon: User },
  { id: 3, name: "Payment", icon: CreditCard },
];

const countries = [
  { code: "BD", name: "Bangladesh" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "GB", name: "United Kingdom" },
  { code: "OTHER", name: "Other" },
];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [selectedService, setSelectedService] = useState(
    searchParams.get("service") || "llc-formation"
  );
  const [selectedPackage, setSelectedPackage] = useState(
    searchParams.get("package") || "standard"
  );
  const [selectedState, setSelectedState] = useState(
    searchParams.get("state") || "WY"
  );

  const [formData, setFormData] = useState({
    // LLC Details
    llcName: "",
    llcName2: "",
    llcName3: "",
    llcPurpose: "General business purposes",
    // Contact Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "BD",
    // Terms
    agreeTerms: false,
  });

  const service = services.find((s) => s.slug === selectedService);
  const pkg = service?.packages.find(
    (p) => p.name.toLowerCase() === selectedPackage
  );
  const state = states.find((s) => s.code === selectedState);

  const serviceFee = pkg?.price || 0;
  const stateFee = state?.fee || 0;
  const total = serviceFee + stateFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          packageId: selectedPackage,
          stateCode: selectedState,
          llcName: formData.llcName,
          llcActivity: formData.llcPurpose,
          contactInfo: {
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
          },
          total,
          serviceFee,
          stateFee,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // For demo, redirect to success page
        router.push("/checkout/success?demo=true");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // For demo, redirect to success page anyway
      router.push("/checkout/success?demo=true");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <Link
          href={`/services/${selectedService}`}
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service
        </Link>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span className="hidden text-sm font-medium sm:inline">
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-8 sm:w-16",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Package</CardTitle>
                  <CardDescription>
                    Choose the service and package that fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service */}
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select
                      value={selectedService}
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.slug} value={s.slug}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Package */}
                  <div className="space-y-2">
                    <Label>Package</Label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {service?.packages.map((p) => (
                        <div
                          key={p.name}
                          onClick={() => setSelectedPackage(p.name.toLowerCase())}
                          className={cn(
                            "cursor-pointer rounded-lg border p-4 transition-all",
                            selectedPackage === p.name.toLowerCase()
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "hover:border-primary/50"
                          )}
                        >
                          {p.popular && (
                            <Badge className="mb-2" variant="secondary">
                              Popular
                            </Badge>
                          )}
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-2xl font-bold text-primary">
                            ${p.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* State (for LLC services) */}
                  {selectedService === "llc-formation" && (
                    <div className="space-y-2">
                      <Label>Formation State</Label>
                      <Select
                        value={selectedState}
                        onValueChange={setSelectedState}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.name} - ${s.fee} state fee
                              {s.popular && " ⭐"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        ⭐ Wyoming is recommended for most international
                        entrepreneurs
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Business & Contact Details</CardTitle>
                  <CardDescription>
                    Provide the details for your LLC formation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* LLC Name Options */}
                  {selectedService === "llc-formation" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="llcName">
                          Preferred LLC Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="llcName"
                          name="llcName"
                          placeholder="e.g., Global Ventures LLC"
                          value={formData.llcName}
                          onChange={handleInputChange}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Must end with LLC, L.L.C., or Limited Liability Company
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="llcName2">
                          2nd Choice (Optional)
                        </Label>
                        <Input
                          id="llcName2"
                          name="llcName2"
                          placeholder="Alternative name if first is unavailable"
                          value={formData.llcName2}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="llcPurpose">Business Purpose</Label>
                        <Textarea
                          id="llcPurpose"
                          name="llcPurpose"
                          value={formData.llcPurpose}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Contact Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, country: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Payment</CardTitle>
                  <CardDescription>
                    Review your order and proceed to payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="font-semibold">Order Summary</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Service</span>
                        <span className="font-medium">{service?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Package</span>
                        <span className="font-medium">{pkg?.name}</span>
                      </div>
                      {selectedService === "llc-formation" && (
                        <>
                          <div className="flex justify-between">
                            <span>State</span>
                            <span className="font-medium">{state?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>LLC Name</span>
                            <span className="font-medium">{formData.llcName}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="font-semibold">Contact Details</h3>
                    <div className="mt-4 space-y-1 text-sm">
                      <p>
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p>{formData.email}</p>
                      {formData.phone && <p>{formData.phone}</p>}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: checked as boolean,
                        }))
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm leading-tight text-muted-foreground"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      . I understand this is not legal advice.
                    </Label>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <Shield className="h-4 w-4" />
                    <span>
                      Secure payment powered by Stripe. Your data is encrypted.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={!formData.agreeTerms || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ${total}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">${serviceFee}</span>
                </div>
                {selectedService === "llc-formation" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      State Fee ({state?.name})
                    </span>
                    <span className="font-medium">${stateFee}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${total}</span>
                </div>

                {/* What's Included */}
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium">What's Included:</p>
                  <ul className="space-y-1">
                    {pkg?.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Guarantee */}
                <div className="mt-4 rounded-lg bg-muted p-3 text-center text-sm">
                  <p className="font-medium">100% Satisfaction Guarantee</p>
                  <p className="text-muted-foreground">
                    30-day money back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading checkout...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  );
}
