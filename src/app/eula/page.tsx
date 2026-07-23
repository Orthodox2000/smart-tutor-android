'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import PageBackButton from '../../components/PageBackButton';

export default function EULAPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 pt-4 px-4 animate-fade-in">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Legal</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">End User License Agreement</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors EULA</p>
            <p className="text-[10px] text-slate-400 font-medium">Last Updated: January 1, 2025</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-500 leading-relaxed">
          This End User License Agreement (&quot;EULA&quot;) is a legal agreement between you (&quot;User&quot; or &quot;you&quot;)
          and Smart Tutors (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) for the use of the Smart Tutors mobile application
          (package: com.ankit.smarttutors) and related services (collectively, the &quot;App&quot;).
        </p>

        <div className="space-y-6 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, copying, or otherwise using the App, you agree to be bound by the
              terms of this EULA. If you do not agree to these terms, do not download, install, or use the
              App. This EULA supplements and incorporates by reference the Smart Tutors Terms &amp; Conditions
              and Privacy Policy available at <span className="font-bold text-slate-700">https://smarttutors.co.in</span>.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. License Grant</h2>
            <p>
              Subject to your compliance with this EULA, Smart Tutors grants you a limited, non-exclusive,
              non-transferable, revocable, personal license to download, install, and use the App on a
              mobile device that you own or control, solely for your personal, non-commercial educational
              purposes. This license does not include any right to resell, sublicense, or commercially
              distribute the App or any of its content.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Restrictions</h2>
            <p className="mb-2">You shall not:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Copy, modify, adapt, translate, or create derivative works of the App</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the App</li>
              <li>Remove, alter, or obscure any proprietary notices, labels, or marks on the App</li>
              <li>Use the App for any commercial purpose without explicit written permission from Smart Tutors</li>
              <li>Use automated systems (bots, spiders, scrapers) to access or interact with the App</li>
              <li>Attempt to gain unauthorised access to the App, its servers, or any connected systems</li>
              <li>Circumvent, disable, or interfere with security features or access controls of the App</li>
              <li>Rent, lease, lend, sell, or redistribute the App to any third party</li>
              <li>Use the App in any manner that violates applicable local, state, national, or international law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. Intellectual Property</h2>
            <p>
              The App, including all content, features, functionality, user interface, design, code, graphics,
              animations, sounds, and documentation, is owned by Smart Tutors and is protected by Indian and
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
              This EULA does not grant you any right, title, or interest in or to the App, its trademarks,
              logos, or brand names. All rights not expressly granted to you are reserved by Smart Tutors.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. User Content</h2>
            <p>
              Any content you submit through the App — including messages, feedback, assignments, and quiz
              responses — remains your property. By submitting content, you grant Smart Tutors a
              non-exclusive, worldwide, royalty-free license to use, display, store, and process such
              content solely for the purpose of providing educational services to you and your institution.
              This license terminates when you delete your content or your account, except where retention
              is required by law or institutional policy.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Third-Party Services</h2>
            <p>
              The App may integrate with or provide access to third-party services, including Google Meet
              for live sessions, Firebase for authentication and cloud storage, AI services for educational
              features, and payment gateways. Your use of these third-party services is governed by their
              respective terms and conditions. Smart Tutors does not control, endorse, or assume
              responsibility for any third-party services, and your use of them is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Updates and Modifications</h2>
            <p>
              Smart Tutors may release updates, patches, or new versions of the App from time to time to
              improve functionality, fix bugs, add features, or address security vulnerabilities. Such
              updates may be installed automatically without additional notice or consent. You acknowledge
              that automatic updates are necessary for the proper functioning and security of the App.
              Smart Tutors reserves the right to modify, suspend, or discontinue the App (or any part
              thereof) at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Termination</h2>
            <p>
              This EULA is effective until terminated. Your rights under this EULA will terminate
              automatically if you fail to comply with any of its terms. Upon termination, you must
              immediately cease all use of the App and destroy all copies of the App in your possession
              or control. Termination does not entitle you to any refund of fees paid. Smart Tutors may
              also terminate your access to the App if you violate the Terms &amp; Conditions or for any
              other reason at its sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. SMART TUTORS
              DOES NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES
              OR OTHER HARMFUL COMPONENTS. YOU USE THE APP AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SMART TUTORS, ITS
              DIRECTORS, EMPLOYEES, PARTNERS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
              DATA, BUSINESS OPPORTUNITIES, OR ACADEMIC PROGRESS, ARISING FROM YOUR USE OF OR INABILITY
              TO USE THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL AGGREGATE
              LIABILITY SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO SMART TUTORS IN THE TWELVE (12) MONTHS
              PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">11. Governing Law</h2>
            <p>
              This EULA shall be governed by and construed in accordance with the laws of India. Any
              disputes arising from this EULA or your use of the App shall be subject to the exclusive
              jurisdiction of the competent courts in Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">12. Changes to This EULA</h2>
            <p>
              Smart Tutors reserves the right to modify this EULA at any time. Material changes will be
              notified through the App or via email. The &quot;Last Updated&quot; date at the top of this document
              will be revised accordingly. Your continued use of the App after any modifications
              constitutes your acceptance of the modified EULA.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">13. Contact</h2>
            <p>
              If you have any questions about this EULA, please contact us:
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mt-3 space-y-1">
              <p className="text-slate-700">
                <span className="font-bold">Email:</span> support@smarttutors.co.in
              </p>
              <p className="text-slate-700">
                <span className="font-bold">Website:</span> https://smarttutors.co.in
              </p>
              <p className="text-slate-700">
                <span className="font-bold">App:</span> Smart Tutors (com.ankit.smarttutors)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
