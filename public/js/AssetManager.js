export default class AssetsManager {
  Models = {};
  Materials = {};
  Audio = {};
  Textures = {};

  constructor(scene, assets) {
    var { models, materials, textures, audio } = assets;

    this.assetsManager = new BABYLON.AssetsManager(scene);

    this.assetsManager.onTaskSuccessObservable.add((task) => {
      this.Models[task.name] = { name: task.name, meshes: task.loadedMeshes };
    });

    //Models
    var keys = Object.keys(models);
    keys.forEach((key) => {
      this.assetsManager.addMeshTask(
        key,
        "",
        models[key].path,
        models[key].model
      );
    });

    //Materials
    this.materials = materials.map((mat) =>
      BABYLON.NodeMaterial.ParseFromFileAsync(mat.name, mat.path, scene.scene)
    );

    //Textures
    this.textures = textures;

    //Audios
    var keys = Object.keys(audio);
    keys.forEach((key) => {
      this.Audio[key] = new BABYLON.Sound(
        key,
        audio[key].path,
        scene.scene,
        null,
        { loop: audio[key].loop }
      );
    });
  }

  async load() {
    await this.assetsManager.loadAsync();

    let materials = await Promise.all(this.materials);
    materials.forEach((mat) => {
      this.Materials[mat.name] = mat;
    });

    let res = await Promise.all(this.textures.map((path) => fetch(path)));
    let jsons = await Promise.all(res.map((r) => r.json()));
    jsons.forEach((txt) => {
      this.Textures[txt.root.name] = txt;
    });
  }
}
