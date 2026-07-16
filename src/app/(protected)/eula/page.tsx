'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function EULAPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legal</p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">End User License Agreement</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors EULA</p>
            <p className="text-[10px] text-slate-400 font-medium">Effective Date: January 2025</p>
          </div>
        </div>

        <div className="space-y-5 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By downloading, installing, or using the Smart Tutors application (&quot;App&quot;), you agree to be bound by this End User License Agreement (&quot;EULA&quot;). If you do not agree, do not use the App.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. License Grant</h2>
            <p>Smart Tutors grants you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial educational purposes on a mobile device that you own or control.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Restrictions</h2>
            <p>You shall not: (a) copy, modify, or distribute the App; (b) reverse engineer, decompile, or disassemble the App; (c) remove any proprietary notices or labels; (d) use the App for any unlawful purpose; (e) attempt to gain unauthorized access to any part of the App or its related systems; (f) use automated systems to access the App; or (g) transfer your license to any third party.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. Intellectual Property</h2>
            <p>The App, including all content, features, functionality, and design, is owned by Smart Tutors and protected by copyright, trademark, and other intellectual property laws. This EULA does not grant you any right to use our trademarks, logos, or brand names.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. User Content</h2>
            <p>Any content you submit through the App (messages, feedback, assignments) remains yours. By submitting content, you grant Smart Tutors a non-exclusive, worldwide license to use, display, and store such content solely for providing educational services to you and your institution.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Academic Integrity</h2>
            <p>You agree to use the App for legitimate educational purposes only. Any attempt to manipulate attendance records, cheat on tests, submit fraudulent assignments, or misuse the Quiz Arena feature is strictly prohibited and may result in account termination.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Third-Party Services</h2>
            <p>The App may integrate with third-party services (Google Meet, payment gateways, AI services). Your use of these services is subject to their respective terms. Smart Tutors is not responsible for third-party service availability or content.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Disclaimer of Warranties</h2>
            <p>The App is provided &quot;AS IS&quot; without warranties of any kind. Smart Tutors does not warrant that the App will be uninterrupted, error-free, or free of viruses. We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Smart Tutors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of the App.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. Termination</h2>
            <p>This EULA is effective until terminated. Your rights under this EULA will terminate automatically if you fail to comply with any of its terms. Upon termination, you must cease all use of the App and destroy all copies in your possession.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">11. Governing Law</h2>
            <p>This EULA shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Maharashtra, India.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">12. Changes to This EULA</h2>
            <p>Smart Tutors reserves the right to modify this EULA at any time. Material changes will be notified through the App. Continued use after changes constitutes acceptance of the modified EULA.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">13. Contact</h2>
            <p>For questions about this EULA, contact us at <span className="font-bold text-slate-900">info@smarttutors.co.in</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
