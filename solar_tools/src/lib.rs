mod utils;

use image::{
    imageops::{dither, grayscale, resize, ColorMap, FilterType},
    DynamicImage, ImageBuffer, Luma, RgbaImage,
};
use wasm_bindgen::{prelude::*, Clamped};
use web_sys::ImageData;

const SIZE: u32 = 128;

#[wasm_bindgen]
pub fn process_img(data: ImageData) -> Result<ImageData, JsValue> {
    let mut img: RgbaImage = ImageBuffer::from_raw(data.width(), data.height(), data.data().0)
        .ok_or(JsValue::from_str("Could not read image."))?;

    img = resize(&img, SIZE, SIZE, FilterType::Nearest);
    let mut bw_img = grayscale(&img);
    let cmap = CMap {};
    dither(&mut bw_img, &cmap);

    img = DynamicImage::ImageLuma8(bw_img).into_rgba8();

    ImageData::new_with_u8_clamped_array(Clamped(img.as_raw().as_slice()), SIZE)
}

pub struct CMap {}
impl ColorMap for CMap {
    type Color = Luma<u8>;

    fn index_of(&self, color: &Self::Color) -> usize {
        let colors = 8;
        let luma = color.0;

        ((luma[0] / 0xFF) * colors).into()
    }

    fn map_color(&self, color: &mut Self::Color) {
        let new_color = 0xFF * self.index_of(color) as u8;
        let luma = &mut color.0;
        luma[0] = new_color;
    }
}
