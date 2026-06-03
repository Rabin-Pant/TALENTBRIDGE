import { Link } from "react-router-dom";
import { Clock, Briefcase, CheckCircle, Mail } from "lucide-react";

const PendingApproval = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
        <Clock size={32} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
      <p className="text-gray-500 mb-8">Your employer account has been submitted and is waiting for admin review.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left space-y-4">
        {[
          { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", title: "Registration Complete", desc: "Your account details have been saved" },
          { icon: Clock,       color: "text-amber-500", bg: "bg-amber-50", title: "Awaiting Approval",     desc: "Admin will review your account shortly" },
          { icon: Mail,        color: "text-blue-500",  bg: "bg-blue-50",  title: "You'll Be Notified",    desc: "Login to check your approval status" },
          { icon: Briefcase,   color: "text-purple-500",bg: "bg-purple-50",title: "Start Hiring",          desc: "Post jobs once your account is approved" },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link to="/login" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
        Back to Login
      </Link>
    </div>
  </div>
);

export default PendingApproval;