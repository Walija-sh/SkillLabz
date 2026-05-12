const ImageGallery = ({ selfie, front, back }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="space-y-2">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Selfie</span>
      <div className="aspect-3/4 rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner">
        <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
      </div>
    </div>
    <div className="space-y-2">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNIC Front</span>
      <div className="aspect-video rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner">
        <img src={front} alt="CNIC Front" className="w-full h-full object-cover" />
      </div>
    </div>
    <div className="space-y-2">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNIC Back</span>
      <div className="aspect-video rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner">
        <img src={back} alt="CNIC Back" className="w-full h-full object-cover" />
      </div>
    </div>
  </div>
);

export default ImageGallery;