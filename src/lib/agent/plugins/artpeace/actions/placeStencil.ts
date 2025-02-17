import { promises as fs } from 'fs';

export const placeStencil = async () => {
  try {
      const filename = "image2.png";
    if (!filename) {
      throw new Error('No filename found.');
    }

    let buffer;
    try {
      buffer = await fs.readFile(`./uploads/${filename}`);
    } catch (error) {
      throw new Error(error.message);
    }

    const formData = new FormData();
    const file = new File([buffer], filename);

    formData.append(
      'image', file
    );
    const response = await fetch(
      `https://api.art-peace.net/add-stencil-img`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json)
    const imgHash = json.result;
    console.log(imgHash);
    const response2 = await fetch(`https://api.art-peace.net/get-stencil-pixel-data?hash=000cf017dd0b4e888ea888d72a0a856bc6e52328110f5e214f7fd0392ad18ba0`);
    if (!response2.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const response2Data = await response2.json();
    console.log(response2Data);
    const pixelsColorIds = response2Data.data.pixelData
    const stencilWidth = response2Data.data.width
    const stencilHeight = response2Data.data.height
    console.log(pixelsColorIds, stencilHeight, stencilWidth);
  } catch (error) {
    return JSON.stringify({
      status: "error",
      error: {
        code: "PLACE_STENCIL_ERROR",
        message: error.message || 'Failed to generate place_pixel call data'
      }
    })
  }
}