import React from "react";
import MainLayout from "../layouts/MainLayout";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/solid";

function ContactCard({ icon, title, children }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-600 text-white">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-[15px]">{children}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <MainLayout>
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <iframe
              title="SRIPATUM UNIVERSITY"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.017712386303!2d100.58304!3d13.85506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b79e72c6889%3A0x1a5e221d84dd08f8!2sSripatum%20University!5e0!3m2!1sth!2sth!4v1700000000000!5m2!1sth!2sth"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[440px] w-full border-0"
            />
          </div>

          {/* Info cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCard icon={<MapPinIcon className="h-6 w-6" />} title="Address">
              <div className="text-gray-700">
                <span className="font-semibold">SRIPATUM UNIVERSITY</span>
                <p className="mt-2 text-sm leading-6">
                  มหาวิทยาลัยศรีปทุม 2410/2<br />
                  ถ.พหลโยธิน เขตจตุจักร<br />
                  กรุงเทพมหานคร 10900.
                </p>
              </div>
            </ContactCard>

            <ContactCard icon={<PhoneIcon className="h-6 w-6" />} title="Phone">
              <a href="tel:025611721" className="text-sky-700 font-medium hover:underline">
                0 2561 1721
              </a>
            </ContactCard>

            <ContactCard icon={<EnvelopeIcon className="h-6 w-6" />} title="Email">
              <a
                href="mailto:admissions@spu.ac.th"
                className="text-sky-700 break-all font-medium hover:underline"
              >
                admissions@spu.ac.th
              </a>
            </ContactCard>

            <ContactCard icon={<GlobeAltIcon className="h-6 w-6" />} title="Website">
              <a href="#" className="text-sky-700 font-medium hover:underline">
                -------
              </a>
            </ContactCard>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
