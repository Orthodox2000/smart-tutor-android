'use client';

import React from 'react';
import { ScrollText } from 'lucide-react';
import PageBackButton from '../../../components/PageBackButton';

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-fade-in">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Legal</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ScrollText size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors Terms</p>
            <p className="text-[10px] text-slate-400 font-medium">Last Updated: January 1, 2025</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-500 leading-relaxed">
          These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Smart Tutors platform,
          including the mobile application and website at{' '}
          <span className="font-bold text-slate-700">https://smarttutors.co.in</span> (collectively, the &quot;Platform&quot;).
          By accessing or using the Platform, you agree to be bound by these Terms.
        </p>

        <div className="space-y-6 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Smart Tutors Platform, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree
              to these Terms, you must not access or use the Platform. These Terms constitute a legally
              binding agreement between you and Smart Tutors. If you are using the Platform on behalf of an
              institution, you represent that you have the authority to bind that institution to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. User Accounts &amp; Roles</h2>
            <p className="mb-3">The Platform serves the following user roles:</p>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-1">Students</p>
                <p className="text-slate-500">
                  Access courses, attend live sessions, take assessments, track academic progress,
                  participate in Quiz Arena, view certificates, and manage placements.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-1">Parents / Guardians</p>
                <p className="text-slate-500">
                  Monitor their child&apos;s academic activities, attendance, performance analytics,
                  fee status, and communicate with educators.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-1">Educators</p>
                <p className="text-slate-500">
                  Manage courses, conduct live sessions, create and grade assessments, provide feedback,
                  upload study materials, and track student progress.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-1">Administrators</p>
                <p className="text-slate-500">
                  Manage users, courses, fees, platform configuration, and institutional settings.
                </p>
              </div>
            </div>
            <p className="mt-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to provide accurate and complete information
              during registration and to keep your profile information up to date.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Acceptable Use</h2>
            <p className="mb-2">You agree to use the Platform only for lawful, educational purposes. You must not:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Use the Platform for any unlawful, fraudulent, or malicious purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
              <li>Interfere with or disrupt the Platform&apos;s servers, networks, or infrastructure</li>
              <li>Impersonate another person or misrepresent your identity or affiliation</li>
              <li>Upload or transmit viruses, malware, or other harmful code</li>
              <li>Use automated systems (bots, scrapers) to access the Platform without written permission</li>
              <li>Manipulate attendance records, cheat on assessments, or commit academic dishonesty</li>
              <li>Share your account credentials with unauthorised third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. Intellectual Property</h2>
            <p>
              All content provided through the Platform — including but not limited to course materials,
              study resources, lecture notes, faculty content, quizzes, certificates, the SmartTutors AI
              Chatbot output, app design, graphics, logos, and software — is the exclusive property of
              Smart Tutors or its content providers and is protected by Indian and international copyright,
              trademark, and intellectual property laws. You may not reproduce, distribute, modify, create
              derivative works of, publicly display, or commercially exploit any content without explicit
              written permission from Smart Tutors.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. Payment Terms</h2>
            <p className="mb-3">
              Course fees are set by the associated institution and are due according to the payment schedule
              displayed in the App. The following payment terms apply:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>All payments are processed through secure third-party payment gateways</li>
              <li>Smart Tutors does not directly store your credit/debit card information</li>
              <li>Digital receipts are generated for all successful transactions</li>
              <li>Refund policies are determined by the institution; contact your administrator for details</li>
              <li>Outstanding fee balances may result in restricted access to courses and features</li>
              <li>Fee amounts and payment schedules are subject to change by the institution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Communication &amp; Notifications</h2>
            <p>
              The Platform may send push notifications, emails, and in-app messages for important updates
              such as new messages, session reminders, attendance alerts, fee reminders, assessment deadlines,
              and certificate issuance. You can manage your notification preferences in your device settings or
              within the app. Opting out of notifications may cause you to miss important information related
              to your courses or account.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Assessments &amp; Academic Integrity</h2>
            <p>
              All tests, quizzes, and assignments are for educational assessment purposes. You agree to
              complete all assessments honestly and independently. The use of external aids, sharing answers
              with other students, accessing unauthorised materials during tests, or any form of academic
              dishonesty is strictly prohibited. Violations may result in score cancellation, course
              disqualification, account suspension, or permanent termination at the discretion of the
              institution and Smart Tutors.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Certificates</h2>
            <p>
              Digital certificates are issued upon successful completion of courses or programmes as
              determined by the institution. Certificates are digitally signed and verifiable through the
              Platform. Tampering with, forging, or misrepresenting certificates is a serious violation and
              may result in account termination and potential legal action.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. AI-Powered Features</h2>
            <p>
              The Platform includes AI-powered features such as the SmartTutors AI Chatbot and Quiz Arena.
              AI-generated content is provided for educational assistance and may not always be accurate,
              complete, or suitable for all purposes. You should verify critical information independently.
              AI interactions may be logged and analysed for service improvement purposes. Smart Tutors does
              not guarantee the accuracy of AI-generated content and is not liable for decisions made based
              on such content.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. Third-Party Services</h2>
            <p>
              The Platform integrates with third-party services including Google Meet for live sessions,
              Firebase for authentication, and payment gateways. Your use of these third-party services is
              subject to their respective terms and privacy policies. Smart Tutors is not responsible for
              the availability, accuracy, or practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Smart Tutors shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of profits,
              revenue, data, or academic opportunities arising from your use of or inability to use the
              Platform. We strive for high availability but do not guarantee uninterrupted or error-free
              service. We are not liable for service interruptions, data loss, or third-party actions
              affecting the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">12. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you violate these
              Terms, engage in fraudulent or harmful activity, or if required by your institution or by
              law. Upon termination, your access to the Platform and all associated data will be revoked.
              You may also request account deletion by contacting us. Certain data may be retained as
              required by law or for institutional record-keeping purposes.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">13. Governing Law &amp; Disputes</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes
              arising from these Terms or your use of the Platform shall be subject to the exclusive
              jurisdiction of the competent courts in Maharashtra, India. You agree to first attempt to
              resolve any dispute informally by contacting us before initiating formal legal proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">14. Changes to Terms</h2>
            <p>
              Smart Tutors reserves the right to modify these Terms at any time. Significant changes will
              be communicated through the Platform via notification or email. The &quot;Last Updated&quot; date at
              the top of this document will be revised accordingly. Your continued use of the Platform after
              any modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">15. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
