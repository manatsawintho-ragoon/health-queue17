import MainLayout from "../layouts/MainLayout";
import heroImg from "../assets/spu-building.jpg";
import { services } from "../data/services";

export default function Service() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-[#e6f3f5]">
        <img
          src={heroImg}
          alt="Service Hero"
          className="w-full h-[240px] object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#004f5e]/80">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            บริการของเรา
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            ดูแลผิวพรรณและความงามครบวงจร ด้วยทีมแพทย์เฉพาะทาง
          </p>
        </div>
      </section>

      {/* Service List */}
      <section className="py-16 bg-[#f8fcfd] px-6">
        <h2 className="text-3xl font-bold text-center text-[#006680] mb-10">
          รายการบริการทั้งหมด
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-md border border-[#006680]/20 hover:shadow-lg hover:border-[#006680] transition p-6"
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold text-[#006680] mb-2">
                {s.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{s.description}</p>
              <button className="mt-2 bg-[#006680] hover:bg-[#0289a7] text-white px-6 py-2 rounded-full font-medium text-sm transition cursor-pointer">
                ดูรายละเอียด
              </button>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
