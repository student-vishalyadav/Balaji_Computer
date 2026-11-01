import React from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    Award,
    Monitor,
    BookOpen,
    Users,
    GraduationCap,
    ArrowRight,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export const About = () => {
    return (
        <div className="space-y-16 pb-16">
            <PageHeader
                title="About Balaji Computer"
                subtitle="Dedicated to excellence in practical computer coaching, digital literacy, and professional skill enhancement since 2012."
                badge="Premier Computer Institute"
                breadcrumbs={[{ label: "About Us" }]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Mission & Vision Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <Badge variant="primary" size="md">
                            Our Institute Story
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                            Committed to Transforming Novice Learners into Industry-Ready Professionals
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            Established with the guiding vision of making high-quality, practical computer education accessible to all students, <strong>Balaji Computer</strong> has grown into a trusted destination for IT diplomas, computerized accounting, typing proficiency, and software programming.
                        </p>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            Our pedagogy focuses on <strong>"Learning by Doing"</strong>. Every student is provided dedicated one-on-one computer access, allowing them to solve real-world case studies, process authentic GST invoices, and write clean software code under senior faculty mentorship.
                        </p>

                        <div className="pt-2">
                            <Link to="/courses">
                                <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                                    Explore Our Programs
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="p-6 bg-blue-50/60 border-blue-100 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">Our Mission</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                To equip every aspiring learner with employable digital competencies through structured curricula, modern computer labs, and ethical training.
                            </p>
                        </Card>

                        <Card className="p-6 bg-amber-50/60 border-amber-100 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                                <Award className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">Our Vision</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                To be recognized as the regional benchmark institute for technology coaching, vocational skill development, and career mentorship.
                            </p>
                        </Card>

                        <Card className="p-6 bg-emerald-50/60 border-emerald-100 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">Modern Infrastructure</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                High-speed internet, continuous power backup, ergonomic workstations, and the latest software licenses for uninterrupted learning.
                            </p>
                        </Card>

                        <Card className="p-6 bg-purple-50/60 border-purple-100 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">Valid Certification</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Institute diplomas and skill certificates verified with unique serial numbers for government, corporate, and private job applications.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Institute Director / Leadership message */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-4">
                        <Badge variant="warning" size="sm">
                            Director's Desk
                        </Badge>
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            "Education is not just about clearing tests; it is about building the capability to build a sustainable life."
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            At Balaji Computer, we take pride in seeing hundreds of our students succeed as accounting executives, data entry specialists, computer teachers, and software developers across the country. Our doors are always open to anyone with the dedication to learn.
                        </p>
                        <div className="pt-2">
                            <p className="font-bold text-white text-base">Management & Academic Council</p>
                            <p className="text-xs text-blue-400">Balaji Computer Coaching Institute</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

