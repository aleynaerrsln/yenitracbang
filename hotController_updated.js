// hotController.js - getHotPlaylists Fonksiyonu GÜNCELLENDİ
// Her genre'den MULTIPLE playlist getir (mobil ile uyumlu)

/**
 * @route   GET /api/hot
 * @desc    Her genre'den birden fazla admin playlist'i getir (HOT sayfası - Mobil ile uyumlu)
 * @access  Public
 */
exports.getHotPlaylists = async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Her genre'den kaç tane playlist getireceğiz

    // Cache kontrol
    const cacheKey = `${CACHE_KEYS.HOT_PLAYLISTS}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const genres = ['afrohouse', 'indiedance', 'organichouse', 'downtempo', 'melodichouse'];
    let allPlaylists = [];

    // Her genre için birden fazla playlist'i paralel olarak getir
    const playlistPromises = genres.map(genre =>
      Playlist.find({  // ⭐ findOne yerine find kullan
        genre,
        isAdminPlaylist: true,
        isPublic: true,
        isActive: true
      })
        .populate({
          path: 'musics',
          match: { isActive: true },
          select: 'title artist imageUrl genre platformLinks likes views userLikes isFeatured metadata'
        })
        .populate({
          path: 'userId',
          select: 'username firstName lastName profileImage'
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))  // ⭐ Her genre'den limit kadar getir
        .lean()
    );

    const results = await Promise.all(playlistPromises);

    // Sonuçları formatla ve birleştir
    results.forEach((playlists) => {
      if (playlists && playlists.length > 0) {
        // Her playlist'i formatla ve ekle
        playlists.forEach(playlist => {
          if (playlist.musics && playlist.musics.length > 0) {
            allPlaylists.push(formatPlaylistData(playlist));
          }
        });
      }
    });

    const response = {
      success: true,
      message: 'Hot playlist\'ler başarıyla getirildi',
      hotPlaylists: allPlaylists,
      count: allPlaylists.length
    };

    // Cache kaydet
    await setCache(cacheKey, response, CACHE_TTL.HOT);

    return res.json(response);

  } catch (err) {
    console.error('❌ Get hot playlists error:', err);
    return errorResponse(
      res,
      'HOT playlist\'ler yüklenirken hata oluştu',
      500,
      err
    );
  }
};
