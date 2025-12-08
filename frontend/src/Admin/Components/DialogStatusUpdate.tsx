import { X, CheckCircle } from "lucide-react";

interface DialogStatusUpdateProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  currentStatus: string;
  newStatus: string;
  isLoading?: boolean;
}

export const DialogStatusUpdate = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  currentStatus,
  newStatus,
  isLoading = false,
}: DialogStatusUpdateProps) => {
  if (!open) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
      case "Hoàn thành":
        return "bg-green-100 text-green-700";
      case "Đang giao":
      case "Đang xử lý":
        return "bg-blue-100 text-blue-700";
      case "Chờ xử lý":
        return "bg-yellow-100 text-yellow-700";
      case "Đã hủy":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-indigo-600" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-4">{message}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Trạng thái hiện tại:
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                      currentStatus
                    )}`}
                  >
                    {currentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trạng thái mới:</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                      newStatus
                    )}`}
                  >
                    {newStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                "Xác nhận"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
