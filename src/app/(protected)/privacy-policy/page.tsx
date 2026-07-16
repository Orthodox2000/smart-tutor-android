'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legal</p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors</p>
            <p className="text-[10px] text-slate-400 font-medium">Effective Date: January 2025</p>
          </div>
        </div>

        <div className="space-y-5 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, username, email address, mobile number, date of birth, education level, and academic records. We also collect usage data such as login timestamps, device information, and app interaction patterns to improve our services.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve our educational services, including course management, attendance tracking, performance analytics, notifications, and communication between students, parents, educators, and administrators. We may also use aggregated, anonymized data for research and service improvement.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal information. We may share your data with: (a) educators and administrators within your institution for academic purposes, (b) parents or guardians for student accounts, (c) service providers who assist in operating our platform under strict confidentiality agreements, and (d) authorities when required by law.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services. Academic records may be retained for a longer period as required for educational and legal compliance. You may request deletion of your account data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, update, or delete your personal information at any time through your profile settings or by contacting us. You may also request a copy of all data we hold about you.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Children&apos;s Privacy</h2>
            <p>Our services are designed for students of all ages. For users under 13, we require verifiable parental consent before collecting personal information. Parents can review, delete, and refuse further collection of their child&apos;s data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Notifications</h2>
            <p>We may send push notifications for important updates such as new messages, session reminders, attendance alerts, and fee reminders. You can manage notification preferences in your device settings or within the app.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy within the app and updating the effective date. Your continued use of the app after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us at <span className="font-bold text-slate-900">info@smarttutors.co.in</span> or reach us via WhatsApp at <span className="font-bold text-slate-900">+91 88504 47887</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
