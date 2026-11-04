import { wajibPeran } from "@/lib/auth";
import { jumlahMenunggu } from "@/lib/data";
import { BilahAtasAdmin, RelAdmin } from "@/components/admin/navigasi";

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const admin = await wajibPeran("ADMIN");
  const menunggu = await jumlahMenunggu();
  return (
    <div className="flex min-h-full flex-1">
      <RelAdmin menunggu={menunggu} nama={admin.nama} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BilahAtasAdmin menunggu={menunggu} nama={admin.nama} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
