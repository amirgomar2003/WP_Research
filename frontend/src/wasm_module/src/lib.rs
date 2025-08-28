use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
pub fn grayscale(data: &mut [u8], width: u32, height: u32) -> ImageData {
    for i in (0..(width * height * 4) as usize).step_by(4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let avg = ((r as u32 + g as u32 + b as u32) / 3) as u8;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }

    ImageData::new_with_u8_clamped_array_and_sh(wasm_bindgen::Clamped(data), width, height)
        .unwrap()
}