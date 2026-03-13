import "./globals.css";

export const metadata = {
    title: {default: "LabFlow", template: "%s | LabFlow"},
    description: "Lab Management System",
};

function Sidebar() {
    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-700 p-4">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-white">LabFlow</h1>
                <p className="text-gray-400 text-sm">实验室管理系统</p>
            </div>

            <nav className="space-y-2">
                <a href="/dashboard"
                   className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="ml-3">仪表板</span>
                </a>
                <a href="/instrument"
                   className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="ml-3">设备管理</span>
                </a>
                <a href="/lab"
                   className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="ml-3">实验室管理</span>
                </a>
                <a href="/reservation"
                   className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="ml-3">实验室/仪器预约</span>
                </a>
                {/*<a href="/role" className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">*/}
                {/*  <span className="ml-3">角色管理</span>*/}
                {/*</a>*/}
                <a href="/user"
                   className="flex items-center p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="ml-3">用户管理</span>
                </a>
            </nav>

            {/*<div className="absolute bottom-4 left-4 right-4">*/}
            {/*  <div className="p-3 bg-gray-800 rounded-lg">*/}
            {/*    <p className="text-sm text-gray-300">当前用户</p>*/}
            {/*    <p className="text-white">管理员</p>*/}
            {/*  </div>*/}
            {/*</div>*/}
        </div>

    );
}


export default function RootLayout({children}) {
    return (
        <div>
            <Sidebar/>
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
}