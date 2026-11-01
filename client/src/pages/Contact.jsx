import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    CheckCircle,
    MessageSquare,
    HelpCircle,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        courseOfInterest: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const contactConfig = {
        institute: "Balaji Computer",
        address: "Near Main Market, Coaching Center Hub, Main Road",
        city: "City Center, Pin - 000000",
        phone: "+91 98765 43210 / +91 91234 56789",
        email: "admissions@balajicomputer.edu",
        hours: "Monday to Saturday: 8:00 AM - 7:00 PM (Sunday Closed)",
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in your name, email, and inquiry message.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            toast.success("Thank you! Your message has been received. Our counselor will contact you shortly.");
        }, 800);
    };

    return (
        <div className="space-y-16 pb-16">
            <PageHeader
                title="Contact & Admissions Office"
                subtitle="Have questions about course syllabi, batch timings, or fee structure? Get in touch with our counselors."
                badge="Reach Out To Us"
                breadcrumbs={[{ label: "Contact Us" }]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Contact Details Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="p-8 space-y-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white border-0">
                            <div>
                                <h3 className="text-xl font-bold text-white">Institute Admissions Desk</h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Walk in for a live lab counseling session or contact our helpdesk.
                                </p>
                            </div>

                            <div className="space-y-5 text-sm text-slate-300">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Campus Location</p>
                                        <p className="text-xs text-slate-300 mt-0.5">{contactConfig.address}</p>
                                        <p className="text-xs text-slate-400">{contactConfig.city}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Telephone / WhatsApp</p>
                                        <p className="text-xs text-slate-300 mt-0.5">{contactConfig.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Official Email</p>
                                        <p className="text-xs text-slate-300 mt-0.5">{contactConfig.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Office & Lab Hours</p>
                                        <p className="text-xs text-slate-300 mt-0.5">{contactConfig.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Inquiry Form Column */}
                    <div className="lg:col-span-7">
                        <Card className="p-8 sm:p-10 border-slate-200">
                            {submitted ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Inquiry Received!</h3>
                                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                                        Thank you for contacting Balaji Computer. One of our course instructors will reach out to answer your queries and book your lab slot.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({
                                                name: "",
                                                email: "",
                                                phone: "",
                                                courseOfInterest: "",
                                                message: "",
                                            });
                                        }}
                                    >
                                        Send Another Inquiry
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Send an Online Inquiry</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Fill out the form below and we'll reply within 24 business hours.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Your Name"
                                            name="name"
                                            placeholder="e.g. Ankit Sharma"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <Input
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="ankit@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Course of Interest
                                        </label>
                                        <select
                                            name="courseOfInterest"
                                            value={formData.courseOfInterest}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="">-- Select Course (Optional) --</option>
                                            <option value="ADCA">ADCA (12 Months Diploma)</option>
                                            <option value="DCA">DCA (6 Months Diploma)</option>
                                            <option value="TALLY">Tally Prime with GST</option>
                                            <option value="WEBDEV">Full Stack Web Development</option>
                                            <option value="PYTHON">Python & Data Analytics</option>
                                            <option value="DTP">Graphic Design & DTP</option>
                                            <option value="CCC">CCC / Basic Computer Course</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Your Question / Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Write your questions regarding batch timings, fee installments, or admission criteria..."
                                            required
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        loading={isSubmitting}
                                        icon={Send}
                                        iconPosition="right"
                                    >
                                        Submit Inquiry
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

