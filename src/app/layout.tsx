import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "TapServe - Restaurant Management",
  description: "Complete restaurant expense management system",
};

type RootLayoutProps = {
  children: React.ReactNode;
};


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="bg-background text-foreground antialiased font-sans">
          <ThemeProvider 
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-compact-sm border-b bg-background px-compact-lg transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10">
                  <div className="flex items-center gap-compact-sm flex-1">
                    <SidebarTrigger className="-ml-1" />
                    <div className="ml-auto">
                      <ModeToggle />
                    </div>
                  </div>
                </header>
                <main className="flex flex-1 flex-col gap-compact-lg p-compact-xl pt-compact-lg">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}