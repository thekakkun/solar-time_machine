mod utils;

use image::{
    imageops::{dither, grayscale, resize, ColorMap, FilterType},
    ImageBuffer, Luma, RgbaImage,
};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

pub struct CMap {
    pub colors: u8,
}
impl CMap {
    pub fn new(colors: u8) -> Self {
        Self { colors }
    }
}
impl ColorMap for CMap {
    type Color = Luma<u8>;

    fn index_of(&self, color: &Self::Color) -> usize {
        ((color.0[0] as f32 / 0xFF as f32).powi(2) * (self.colors - 1) as f32).round() as usize
    }

    fn map_color(&self, color: &mut Self::Color) {
        let new_color = 0xFF as f32 * self.index_of(color) as f32 / (self.colors - 1) as f32;
        color.0[0] = new_color.round() as u8;
    }
}

#[wasm_bindgen]
pub fn process_img(data: ImageData, out_size: u32) -> Result<Vec<u8>, JsValue> {
    let mut img: RgbaImage = ImageBuffer::from_raw(data.width(), data.height(), data.data().0)
        .ok_or(JsValue::from_str("Could not read image."))?;
    img = resize(&img, out_size, out_size, FilterType::Nearest);
    let mut bw_img = grayscale(&img);
    let cmap = CMap::new(8);
    dither(&mut bw_img, &cmap);

    Ok(bw_img.as_raw().to_vec())
}

fn kadane(array: &Vec<u8>) -> (u32, usize, usize) {
    let mut max_ending_here = u32::MIN;
    let mut max_so_far = u32::MIN;
    let mut max_start = 0;
    let mut current_start = 0;
}

#[wasm_bindgen]
pub struct BoundingBox {
    pub x1: usize,
    pub y1: usize,
    pub x2: usize,
    pub y2: usize,
}

#[wasm_bindgen]
pub fn sun_finder(data: ImageData) -> Result<BoundingBox, JsValue> {
    let img: RgbaImage = ImageBuffer::from_raw(data.width(), data.height(), data.data().0)
        .ok_or(JsValue::from_str("Could not read image."))?;
    let (row, col) = img.dimensions();

    let bw_img = grayscale(&img);
}
