mod utils;

use image::{imageops::grayscale_with_type_alpha, ImageBuffer, Rgba};
use wasm_bindgen::{prelude::*, Clamped};
use web_sys::ImageData;

#[wasm_bindgen]
pub fn process_img(data: ImageData) -> Result<ImageData, JsValue> {
    let mut img = ImageBuffer::<Rgba<_>, _>::from_raw(data.width(), data.height(), data.data().0)
        .ok_or(JsValue::from_str("Could not read image."))?;

    img = grayscale_with_type_alpha::<Rgba<_>, _>(&img);
    ImageData::new_with_u8_clamped_array(Clamped(img.as_raw().as_slice()), data.width())
}
