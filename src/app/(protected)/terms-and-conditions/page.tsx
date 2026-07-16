'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ScrollText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legal</p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Terms & Conditions</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ScrollText size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors Terms</p>
            <p className="text-[10px] text-slate-400 font-medium">Effective Date: January 2025</p>
          </div>
        </div>

        <div className="space-y-5 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using the Smart Tutors platform, including the mobile application and website (collectively, the &quot;Platform&quot;), you agree to these Terms and Conditions. These terms constitute a legally binding agreement between you and Smart Tutors.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. Description of Service</h2>
            <p>Smart Tutors is an educational technology platform that provides course management, live session hosting, attendance tracking, assessment tools, digital library access, performance analytics, placement assistance, and communication tools for students, parents, educators, and administrators.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Account Registration</h2>
            <p>You may register through an invitation from your institution or administrator. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration and to keep your profile information up to date.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. User Roles & Responsibilities</h2>
            <p>The Platform serves multiple roles: (a) Students access courses, attend sessions, take tests, and track progress; (b) Parents monitor their child&apos;s academic activities; (c) Educators manage courses, conduct sessions, create assessments, and provide feedback; (d) Administrators manage users, courses, and platform configuration. Each role has specific permissions and responsibilities.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. Fees & Payments</h2>
            <p>Course fees are set by the institution and are due as per the payment schedule displayed in the app. Payments are processed through secure third-party payment gateways. Smart Tutors does not directly store your payment card information. All fees are non-refundable unless otherwise specified by the institution.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Attendance Policy</h2>
            <p>Live session attendance is tracked automatically when you join via Google Meet. Attendance records are maintained by the system and are visible to students, parents, educators, and administrators. Manipulating attendance records is strictly prohibited.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Assessments & Academic Integrity</h2>
            <p>All tests, quizzes, and assignments are for educational assessment purposes. You agree to complete assessments honestly. Using external aids, sharing answers, or any form of academic dishonesty is prohibited and may result in score cancellation, account suspension, or other disciplinary action.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Certificates</h2>
            <p>Digital certificates are issued upon successful completion of courses or programs as determined by the institution. Certificates are digitally signed and verifiable. Tampering with or forging certificates is a serious violation and may result in legal action.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. Content & Intellectual Property</h2>
            <p>All course content, study materials, faculty notes, and resources provided through the Platform are the intellectual property of Smart Tutors or the respective content creators. You may not reproduce, distribute, or commercially exploit any content without explicit written permission.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. AI Features</h2>
            <p>The Platform includes AI-powered features such as SmartTutors AI Chatbot and Quiz Arena. AI-generated content is provided for educational assistance and may not always be accurate. You should verify critical information independently. AI interactions may be logged for service improvement.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">11. Limitation of Liability</h2>
            <p>Smart Tutors strives for high availability but does not guarantee uninterrupted service. We are not liable for any loss of data, academic disruption, or damages arising from service interruptions, third-party integrations, or user actions on the Platform.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">12. Account Suspension</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or if required by your institution. Upon termination, your access to the Platform and associated data will be revoked.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">13. Governing Law & Disputes</h2>
            <p>These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">14. Changes to Terms</h2>
            <p>Smart Tutors may update these Terms at any time. Significant changes will be communicated through the Platform. Your continued use after modifications constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">15. Contact</h2>
            <p>For questions about these Terms, contact us at <span className="font-bold text-slate-900">info@smarttutors.co.in</span> or WhatsApp <span className="font-bold text-slate-900">+91 88504 47887</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
