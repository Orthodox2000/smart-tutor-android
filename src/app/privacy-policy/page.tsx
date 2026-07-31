'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import PageBackButton from '../../components/PageBackButton';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 pt-4 px-4 animate-fade-in">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Legal</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Smart Tutors</p>
            <p className="text-[10px] text-slate-400 font-medium">Last Updated: July 31, 2026</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-500 leading-relaxed">
          Smart Tutors (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our mobile
          application and website at{' '}
          <span className="font-bold text-slate-700">https://smarttutors.co.in</span> (collectively, the &quot;Platform&quot;).
        </p>

        <div className="space-y-6 text-[13px] text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information that you provide directly and information generated through your use of the Platform.
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-2">Personal Information</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Full name, username, and profile information</li>
                  <li>Email address and mobile phone number</li>
                  <li>Date of birth and gender</li>
                  <li>Education level, grade, and institution details</li>
                  <li>Enrollment data and course registrations</li>
                  <li>Academic records including grades, test scores, and attendance</li>
                  <li>Digital certificates issued through the Platform</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-2">Payment Information</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Fee payment history and outstanding balances</li>
                  <li>Transaction details processed through third-party payment gateways</li>
                  <li>Note: We do not store your credit/debit card numbers or CVV directly</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-2">Device &amp; Usage Information</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Device model, operating system, and unique device identifiers</li>
                  <li>App version and crash reports</li>
                  <li>Login timestamps and session duration</li>
                  <li>Features used, pages viewed, and navigation patterns</li>
                  <li>IP address and approximate geolocation</li>
                  <li>Browser type, referring page, and language preferences</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 mb-2">Audit &amp; Activity Logs</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Actions performed on the Platform, such as login, logout, and password changes</li>
                  <li>Creation, modification, approval, rejection, restoration, and deletion of records and content</li>
                  <li>Assessment submissions, attendance marking, feedback, and payment transactions</li>
                  <li>Account details (user ID, role) and the device/IP address used for each action</li>
                  <li>Timestamps, platform (web or Android app), browser, and operating system</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <span className="font-bold text-slate-700">Education Services:</span> To deliver courses, manage live
                sessions via Google Meet, track attendance, and administer assessments.
              </li>
              <li>
                <span className="font-bold text-slate-700">Progress Tracking:</span> To generate performance analytics,
                monitor academic progress, and provide personalised insights for students and parents.
              </li>
              <li>
                <span className="font-bold text-slate-700">Communication:</span> To send session reminders, attendance
                alerts, fee reminders, new message notifications, and important platform updates.
              </li>
              <li>
                <span className="font-bold text-slate-700">Service Improvement:</span> To analyse aggregated and
                anonymised usage data to improve features, fix bugs, and enhance user experience.
              </li>
              <li>
                <span className="font-bold text-slate-700">AI Features:</span> To power the SmartTutors AI Chatbot
                and Quiz Arena features, and to improve the quality of AI-generated educational content.
              </li>
              <li>
                <span className="font-bold text-slate-700">Compliance:</span> To meet legal obligations, enforce our
                terms, and protect the rights and safety of our users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">3. Information Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <span className="font-bold text-slate-700">Educators &amp; Administrators:</span> Within your institution
                for academic management, grading, and communication.
              </li>
              <li>
                <span className="font-bold text-slate-700">Parents &amp; Guardians:</span> For student accounts, parents
                can view academic progress, attendance, and fee details.
              </li>
              <li>
                <span className="font-bold text-slate-700">Payment Processors:</span> Trusted third-party services that
                process fee payments on our behalf under strict confidentiality.
              </li>
              <li>
                <span className="font-bold text-slate-700">Service Providers:</span> Cloud hosting, analytics, and
                communication providers who assist in operating the Platform under contractual obligations.
              </li>
              <li>
                <span className="font-bold text-slate-700">Legal Requirements:</span> When required by law, court order,
                or government authority, or to protect the rights and safety of Smart Tutors and its users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">4. Data Security</h2>
            <p>
              We implement industry-standard security measures including SSL/TLS encryption for data in transit,
              AES-256 encryption for data at rest, role-based access controls, secure authentication via Firebase,
              and regular security audits. While we strive to protect your information, no method of electronic
              transmission or storage is 100% secure, and we cannot guarantee absolute security. We monitor the
              Platform for unauthorised access, abuse, and wrongdoing, and we act on any misconduct detected,
              including through the audit logs described in this Policy. Users remain solely responsible for
              their own conduct and for the content they choose to share; Smart Tutors does not accept
              responsibility for user misconduct or for the misuse of information shared by users with others.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">5. Audit &amp; Activity Logging</h2>
            <p className="mb-2">
              To maintain security, accountability, and trust on the Platform, we transparently record
              audit logs of significant actions taken by users. Each log entry captures:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>The user account performing the action (name, email, and role)</li>
              <li>The action type (login, logout, create, update, delete, approve, reject, restore, and similar)</li>
              <li>The affected feature or record, along with a description and relevant metadata</li>
              <li>The IP address, platform (web or Android app), browser, operating system, and device type</li>
              <li>Date and time of the action</li>
            </ul>
            <p className="mt-3">
              These logs are used for security monitoring, fraud and misuse detection, dispute resolution,
              auditability of administrative actions, and service improvement. They may be accessed by
              authorised administrators of the Platform and your institution for legitimate educational
              and administrative purposes. Logs are retained as long as required for these purposes and in
              accordance with applicable law. We do not use audit logs to profile or market to you, and we
              do not sell log data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              our services. Academic records may be retained for a longer period as required for educational
              compliance and institutional record-keeping. You may request deletion of your account data at any
              time by contacting us at <span className="font-bold text-slate-700">support@smarttutors.co.in</span>.
              We will process deletion requests within a reasonable timeframe, subject to any legal retention
              obligations.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">7. Children&apos;s Privacy</h2>
            <p>
              The Smart Tutors platform is designed for students of all ages, including those under 13. We are
              committed to protecting children&apos;s privacy in compliance with applicable laws. For users under 13,
              we require verifiable parental or guardian consent before collecting personal information. Parents
              and guardians can review, request correction, or request deletion of their child&apos;s personal data
              by contacting us. We do not knowingly collect personal information from children under 13 without
              proper consent.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">8. Cookies &amp; Tracking</h2>
            <p>
              The Platform may use cookies and similar tracking technologies to maintain session state,
              remember preferences, and analyse usage patterns. Cookies are small data files stored on your
              device that help us provide a better user experience. You can control cookie settings through
              your browser preferences. Disabling cookies may affect certain functionalities of the Platform.
              We may also use third-party analytics tools that collect usage data to help us understand how
              our Platform is used.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">9. Your Rights</h2>
            <p className="mb-3">You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <span className="font-bold text-slate-700">Access:</span> Request a copy of all personal data we hold
                about you, including the audit and activity logs associated with your account.
              </li>
              <li>
                <span className="font-bold text-slate-700">Correction:</span> Request correction of inaccurate or
                incomplete information through your profile settings or by contacting us.
              </li>
              <li>
                <span className="font-bold text-slate-700">Deletion:</span> Request deletion of your personal data,
                subject to legal and institutional retention requirements. Audit logs are retained where
                required for security, accountability, or legal compliance and may be anonymised or removed
                where no such requirement applies.
              </li>
              <li>
                <span className="font-bold text-slate-700">Opt-Out:</span> Manage notification preferences in your
                device settings or within the app at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">10. Third-Party Services</h2>
            <p>
              The Platform integrates with third-party services including Google Meet for live sessions, Firebase
              for authentication and cloud storage, and payment gateways for fee processing. Each third-party
              service has its own privacy policy governing the use of your data. We encourage you to review
              their respective policies. We are not responsible for the privacy practices of third-party
              services.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, legal requirements, or other factors. When we make material changes, we will notify
              you through the Platform and update the &quot;Last Updated&quot; date at the top of this policy. Your
              continued use of the Platform after such changes constitutes your acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 mb-2">12. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact us:
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
