import React from "react";

interface PdfViewerProps {
  pdfUrl: string | null;
  pdfError: string | null;
  pdfLoading: boolean;
  isMobile: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  pdfError,
  pdfLoading,
  isMobile,
}) => {
  if (pdfLoading) {
    return <p className="text-gray-500 text-center">Загрузка PDF...</p>;
  }

  if (pdfError) {
    return (
      <div className="text-center">
        <p className="text-red-500">{pdfError}</p>
        {pdfUrl && !isMobile && (
          <p className="text-gray-500 mt-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Открыть PDF в новой вкладке
            </a>
          </p>
        )}
      </div>
    );
  }

  if (!pdfUrl) {
    return <p className="text-red-500 text-center">PDF не доступен</p>;
  }

  if (isMobile) {
    return (
      <div className="text-center py-8 max-h-48">
        <p className="text-gray-500 text-sm">
          Ваше устройство не поддерживает предпросмотр PDF.
          <br />
          Используйте кнопки ниже для скачивания или копирования ссылки.
        </p>
      </div>
    );
  }

  return (
    <object
      data={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
      type="application/pdf"
      width="100%"
      className="min-h-[50vh] md:h-[600px] border rounded is-mobile:h-[300px]"
    >
      <p className="text-gray-500">Ваш браузер не поддерживает просмотр PDF</p>
    </object>
  );
};

export default PdfViewer;
