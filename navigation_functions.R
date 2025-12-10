# =============================================================================
# NAVIGATION FUNCTIONS
# =============================================================================

# OPTIMIZED LAYER COMBINATION

#' Ultra-fast layer combination with enhanced debugging and terrain preservation
#' @param all_layers List of SpatRaster objects
#' @param session_id Session identifier for isolated processing
#' @return SpatRaster with aligned CRS and proper combination
combine_layers_production <- function(all_layers, session_id = NULL) {
  if (length(all_layers) == 0) {
    stop("No layers provided")
  }
  
  if (length(all_layers) == 1) {
    return(all_layers[[1]])
  }
  
  cat("🔗 Combining", length(all_layers), "layers with CRS alignment\n")
  
  # Filter valid layers once
  valid_layers <- Filter(function(x) {
    inherits(x, "SpatRaster") && ncell(x) > 0
  }, all_layers)
  
  if (length(valid_layers) == 0) {
    stop("No valid layers found")
  }
  
  cat("📊 Valid layers:", length(valid_layers), "\n")
  
  # CRITICAL FIX: Analyze CRS and choose reference
  cat("🔍 Analyzing CRS for alignment...\n")
  
  # Get CRS and resolution info for each layer
  layer_info <- list()
  for (i in seq_along(valid_layers)) {
    layer_name <- names(valid_layers)[i]
    layer <- valid_layers[[i]]
    
    layer_crs <- crs(layer)
    layer_res <- res(layer)[1]
    layer_ext <- ext(layer)
    
    layer_info[[layer_name]] <- list(
      crs = layer_crs,
      resolution = layer_res,
      extent = layer_ext,
      is_utm = grepl("UTM", layer_crs),
      is_albers = grepl("Albers", layer_crs),
      is_geographic = grepl("GEOGCRS", layer_crs)
    )
    
    cat("  Layer", layer_name, ":\n")
    cat("    CRS type:",
        if (layer_info[[layer_name]]$is_utm) "UTM" else
          if (layer_info[[layer_name]]$is_albers) "Albers" else
            if (layer_info[[layer_name]]$is_geographic) "Geographic" else "Other", "\n")
    cat("    Resolution:", round(layer_res, 2), "m\n")
  }
  
  # ENHANCED: Choose the best reference CRS
  # Priority: UTM > Albers > Geographic > Other
  reference_layer_name <- NULL
  reference_layer <- NULL
  
  # 1. Try to find a UTM layer (satellite data usually)
  for (layer_name in names(layer_info)) {
    if (layer_info[[layer_name]]$is_utm) {
      reference_layer_name <- layer_name
      reference_layer <- valid_layers[[layer_name]]
      cat("🎯 Using UTM layer as reference:", layer_name, "\n")
      break
    }
  }
  
  # 2. Fall back to Albers if no UTM
  if (is.null(reference_layer)) {
    for (layer_name in names(layer_info)) {
      if (layer_info[[layer_name]]$is_albers) {
        reference_layer_name <- layer_name
        reference_layer <- valid_layers[[layer_name]]
        cat("🎯 Using Albers layer as reference:", layer_name, "\n")
        break
      }
    }
  }
  
  # 3. Fall back to first layer
  if (is.null(reference_layer)) {
    reference_layer_name <- names(valid_layers)[1]
    reference_layer <- valid_layers[[1]]
    cat("🎯 Using first layer as reference:", reference_layer_name, "\n")
  }
  
  # Get reference properties
  ref_crs <- crs(reference_layer)
  ref_res <- res(reference_layer)
  ref_ext <- ext(reference_layer)
  
  cat("📍 Reference CRS:", as.character(ref_crs), "\n")
  cat("📏 Reference resolution:", round(ref_res[1], 2), "m\n")
  
  # Start with reference layer
  result <- reference_layer
  cat("✅ Started with reference layer:", reference_layer_name, "\n")
  
  # Process remaining layers
  remaining_layers <- valid_layers[names(valid_layers) != reference_layer_name]
  
  if (length(remaining_layers) > 0) {
    cat("🔄 Processing", length(remaining_layers), "additional layers...\n")
    
    for (i in seq_along(remaining_layers)) {
      layer_name <- names(remaining_layers)[i]
      layer <- remaining_layers[[i]]
      
      cat("  Processing", layer_name, "...\n")
      
      tryCatch({
        layer_crs <- crs(layer)
        
        # Check if CRS alignment is needed
        if (!identical(layer_crs, ref_crs)) {
          cat("    🔄 Reprojecting from",
              if (layer_info[[layer_name]]$is_albers) "Albers" else
                if (layer_info[[layer_name]]$is_utm) "UTM" else "Other",
              "to reference CRS\n")
          
          # CRITICAL: Proper reprojection with template
          # Create template from reference layer
          template <- rast(ref_ext, resolution = ref_res, crs = ref_crs)
          
          # Reproject using the template
          layer_reprojected <- project(layer, template, method = "bilinear")
          
          # Validate reprojection
          reproj_values <- values(layer_reprojected, na.rm = TRUE)
          finite_values <- reproj_values[is.finite(reproj_values)]
          
          if (length(finite_values) > 0) {
            cat("    ✅ Reprojection successful -", length(finite_values), "valid values\n")
            cat("    📊 Value range:", round(range(finite_values), 3), "\n")
            layer_to_add <- layer_reprojected
          } else {
            cat("    ❌ Reprojection failed - no valid values after transformation\n")
            next
          }
          
        } else {
          cat("    ✅ CRS already aligned\n")
          
          # Check if resampling is needed for resolution/extent
          if (!identical(ext(layer), ref_ext) || !identical(res(layer), ref_res)) {
            cat("    🔄 Resampling to match reference extent/resolution\n")
            layer_resampled <- resample(layer, reference_layer, method = "bilinear")
            
            # Validate resampling
            resamp_values <- values(layer_resampled, na.rm = TRUE)
            finite_values <- resamp_values[is.finite(resamp_values)]
            
            if (length(finite_values) > 0) {
              cat("    ✅ Resampling successful -", length(finite_values), "valid values\n")
              layer_to_add <- layer_resampled
            } else {
              cat("    ❌ Resampling failed - no valid values\n")
              next
            }
          } else {
            layer_to_add <- layer
          }
        }
        
        # Add layer to result
        result <- c(result, layer_to_add)
        cat("    ✅ Added", layer_name, "to combined result\n")
        
      }, error = function(e) {
        cat("    ❌ Error processing", layer_name, ":", e$message, "\n")
      })
    }
  }
  
  # Final validation
  cat("🔍 Final validation...\n")
  
  final_layers <- nlyr(result)
  final_names <- names(result)
  final_crs <- crs(result)
  
  cat("📊 Final result:\n")
  cat("  Layers:", final_layers, "\n")
  cat("  Names:", paste(final_names, collapse = ", "), "\n")
  cat("  CRS:", as.character(final_crs), "\n")
  cat("  Resolution:", paste(round(res(result), 2), collapse = " x "), "m\n")
  cat("  Extent:", paste(round(as.vector(ext(result)), 0), collapse = ", "), "\n")
  
  # Validate each layer in the final result
  cat("🧪 Validating final layers:\n")
  for (i in 1:nlyr(result)) {
    layer_name <- names(result)[i]
    test_values <- values(result[[i]], na.rm = TRUE)
    finite_values <- test_values[is.finite(test_values)]
    
    if (length(finite_values) > 0) {
      val_range <- range(finite_values)
      cat("  ✅", layer_name, "- Valid (", length(finite_values), "values, range:",
          round(val_range, 3), ")\n")
    } else {
      cat("  ❌", layer_name, "- No valid values in final result\n")
    }
  }
  
  cat("✅ Layer combination completed with CRS alignment\n")
  return(result)
}


# =============================================================================
# EXISTING VALIDATION FUNCTIONS (KEPT)
# =============================================================================

# Validate AOI
validate_aoi <- function(aoi) {
  if (is.null(aoi)) {
    stop("AOI cannot be NULL")
  }
  
  if (!inherits(aoi, "sf")) {
    stop("AOI must be an sf object")
  }
  
  if (nrow(aoi) == 0) {
    stop("AOI is empty")
  }
  
  # Ensure CRS is defined
  if (is.na(st_crs(aoi))) {
    warning("AOI CRS not defined, assuming WGS84")
    st_crs(aoi) <- 4326
  }
  
  # Transform to WGS84 if needed
  if (st_crs(aoi)$input != "EPSG:4326") {
    aoi <- st_transform(aoi, 4326)
  }
  
  return(aoi)
}

# Get appropriate UTM CRS for AOI
get_utm_crs <- function(aoi) {
  centroid <- st_centroid(st_union(aoi))
  coords <- st_coordinates(centroid)
  lon <- coords[1, "X"]
  lat <- coords[1, "Y"]
  
  # Calculate UTM zone
  utm_zone <- floor((lon + 180) / 6) + 1
  
  # Determine hemisphere
  hemisphere <- ifelse(lat >= 0, "north", "south")
  
  # Construct EPSG code
  if (hemisphere == "north") {
    epsg_code <- 32600 + utm_zone  # WGS84 UTM North
  } else {
    epsg_code <- 32700 + utm_zone  # WGS84 UTM South
  }
  
  return(epsg_code)
}

# =============================================================================
# MODULE 1: INPUT VALIDATION AND SETUP
# =============================================================================

#' Validate input parameters for Sentinel-2 processing
#' @param lon Longitude of center point
#' @param lat Latitude of center point
#' @param bbox_size_km Size of bounding box in kilometers
#' @param start_date Character string in YYYY-MM-DD format
#' @param end_date Character string in YYYY-MM-DD format
#' @param resolution Spatial resolution in meters
#' @param cloud_cover_threshold Maximum cloud cover percentage
validate_inputs <- function(lon, lat, bbox_size_km, start_date, end_date,
                            resolution, cloud_cover_threshold) {
  
  # Coordinate validation
  if (!is.numeric(lat) || !is.numeric(lon) || abs(lat) > 90 || abs(lon) > 180) {
    stop("Invalid coordinates: lat must be [-90,90], lon [-180,180]")
  }
  
  # Bounding box validation
  if (bbox_size_km <= 0 || bbox_size_km > 100) {
    stop("bbox_size_km must be between 0 and 100 km")
  }
  
  # Date validation
  tryCatch({
    as.Date(start_date)
    as.Date(end_date)
  }, error = function(e) {
    stop("Invalid date format. Use YYYY-MM-DD format")
  })
  
  if (as.Date(end_date) <= as.Date(start_date)) {
    stop("end_date must be after start_date")
  }
  
  # Resolution validation
  if (!resolution %in% c(5, 10, 20, 60)) {
    warning("Unusual resolution. Recommended: 5, 10, 20, or 60 meters")
  }
  
  # Cloud cover validation
  if (cloud_cover_threshold < 0 || cloud_cover_threshold > 100) {
    stop("cloud_cover_threshold must be between 0 and 100")
  }
  
  return(TRUE)
}

#' Setup processing environment and directories
setup_processing_environment <- function(session_id = NULL) {
  
  # Set gdalcubes options for production
  gdalcubes_options(parallel = min(2, parallel::detectCores() - 1))
  
  # Setup session cache directory
  if (exists("get_session_cache_dir") && !is.null(session_id)) {
    session_cache_dir <- get_session_cache_dir(session_id)
    if (!dir.exists(session_cache_dir)) {
      dir.create(session_cache_dir, recursive = TRUE)
    }
    return(session_cache_dir)
  }
  
  return(NULL)
}

# =============================================================================
# MODULE 2: SPATIAL PROCESSING
# =============================================================================

#' Create spatial boundaries and coordinate transformations
#' @param lon Longitude of center point
#' @param lat Latitude of center point
#' @param bbox_size_km Size of bounding box in kilometers
create_spatial_boundaries <- function(lon, lat, bbox_size_km) {
  
  cat("📍 Creating spatial boundaries...\n")
  
  # Calculate UTM zone
  utm_zone <- floor((lon + 180) / 6) + 1
  target_crs <- ifelse(lat >= 0, 32600 + utm_zone, 32700 + utm_zone)
  
  # Create center point and transform to UTM
  center_wgs <- st_sfc(st_point(c(lon, lat)), crs = 4326)
  center_utm <- st_transform(center_wgs, target_crs)
  center_coords <- st_coordinates(center_utm)
  
  # Create bbox in UTM
  bbox_radius_m <- (bbox_size_km * 1000) / 2
  bbox_utm <- c(
    xmin = center_coords[1] - bbox_radius_m,
    ymin = center_coords[2] - bbox_radius_m,
    xmax = center_coords[1] + bbox_radius_m,
    ymax = center_coords[2] + bbox_radius_m
  )
  
  # Transform bbox to WGS84 for STAC search
  bbox_polygon <- st_sfc(st_polygon(list(matrix(c(
    bbox_utm["xmin"], bbox_utm["ymin"],
    bbox_utm["xmax"], bbox_utm["ymin"],
    bbox_utm["xmax"], bbox_utm["ymax"],
    bbox_utm["xmin"], bbox_utm["ymax"],
    bbox_utm["xmin"], bbox_utm["ymin"]
  ), ncol = 2, byrow = TRUE))), crs = target_crs)
  
  bbox_wgs84 <- st_transform(bbox_polygon, crs = 4326)
  bbox_wgs84 <- st_bbox(bbox_wgs84)
  
  return(list(
    target_crs = target_crs,
    bbox_utm = bbox_utm,
    bbox_wgs84 = bbox_wgs84,
    center_utm = center_utm
  ))
}

# =============================================================================
# MODULE 3: STAC CONNECTION AND SEARCH
# =============================================================================

#' Establish connection to Microsoft Planetary Computer STAC API
create_stac_connection <- function() {
  
  cat("🔗 Connecting to Microsoft Planetary Computer...\n")
  
  tryCatch({
    s <- stac("https://planetarycomputer.microsoft.com/api/stac/v1",
              force_version = "1.0.0")
    
    # Test connection by fetching collections
    collections <- collections(s)
    collections_result <- get_request(collections)
    
    if (is.null(collections_result) || length(collections_result$collections) == 0) {
      stop("Failed to retrieve collections from STAC endpoint")
    }
    
    # Verify Sentinel-2 availability
    s2_available <- any(sapply(collections_result$collections,
                               function(x) x$id == "sentinel-2-l2a"))
    
    if (!s2_available) {
      stop("Sentinel-2 L2A collection not available")
    }
    
    cat("✅ STAC connection successful\n")
    return(s)
    
  }, error = function(e) {
    stop("Failed to connect to Microsoft Planetary Computer: ", e$message)
  })
}

#' Search for Sentinel-2 data using STAC API
#' @param stac_obj STAC connection object
#' @param bbox_wgs84 Bounding box in WGS84 coordinates
#' @param start_date Start date string
#' @param end_date End date string
#' @param cloud_cover_threshold Maximum cloud cover percentage
search_sentinel2_data <- function(stac_obj, bbox_wgs84, start_date, end_date,
                                  cloud_cover_threshold, max_items = 50) {
  
  cat("🔍 Searching for Sentinel-2 data...\n")
  
  # Convert dates to RFC3339 format
  format_rfc3339 <- function(date_string) {
    if (nchar(date_string) == 10) {
      return(paste0(date_string, "T00:00:00Z"))
    }
    return(date_string)
  }
  
  search_with_retries <- function(retries = 3) {
    for (attempt in 1:retries) {
      tryCatch({
        items <- stac_obj %>%
          stac_search(
            collections = "sentinel-2-l2a",
            bbox = c(bbox_wgs84["xmin"], bbox_wgs84["ymin"],
                     bbox_wgs84["xmax"], bbox_wgs84["ymax"]),
            datetime = paste0(format_rfc3339(start_date), "/",
                              format_rfc3339(end_date)),
            limit = max_items
          ) %>%
          post_request() %>%
          items_fetch(progress = FALSE)
        
        return(items)
        
      }, error = function(e) {
        if (attempt == retries) {
          stop("Failed to search Sentinel-2 data after ", retries,
               " attempts: ", e$message)
        }
        cat("⚠️ Search attempt", attempt, "failed, retrying...\n")
        Sys.sleep(1)
      })
    }
  }
  
  items <- search_with_retries()
  
  if (length(items$features) == 0) {
    stop("No Sentinel-2 scenes found for the specified area and time period")
  }
  
  cat("📊 Found", length(items$features), "Sentinel-2 scenes\n")
  return(items)
}

# =============================================================================
# MODULE 4: SCENE ANALYSIS AND SELECTION
# =============================================================================

#' Extract comprehensive scene information from STAC items
#' @param items STAC items object
extract_scene_information <- function(items) {
  
  cat("📊 Analyzing scene information...\n")
  
  scene_info <- data.frame(
    scene_id = character(),
    date = character(),
    cloud_cover = numeric(),
    data_coverage = numeric(),
    processing_level = character(),
    platform = character(),
    mgrs_tile = character(),
    stringsAsFactors = FALSE
  )
  
  for (i in seq_along(items$features)) {
    feature <- items$features[[i]]
    props <- feature$properties
    
    # Safe extraction with null handling
    scene_id <- if (is.null(feature$id)) paste0("scene_", i) else feature$id
    scene_date <- if (is.null(props$datetime)) "unknown" else substr(props$datetime, 1, 10)
    cloud_cover <- if (is.null(props$`eo:cloud_cover`)) NA else props$`eo:cloud_cover`
    data_coverage <- if (is.null(props$`s2:data_coverage_percentage`)) NA else props$`s2:data_coverage_percentage`
    processing_level <- if (is.null(props$`s2:processing_level`)) "L2A" else props$`s2:processing_level`
    platform <- if (is.null(props$platform)) "Sentinel-2" else props$platform
    mgrs_tile <- if (is.null(props$`s2:mgrs_tile`)) "unknown" else props$`s2:mgrs_tile`
    
    scene_info <- rbind(scene_info, data.frame(
      scene_id = scene_id,
      date = scene_date,
      cloud_cover = cloud_cover,
      data_coverage = data_coverage,
      processing_level = processing_level,
      platform = platform,
      mgrs_tile = mgrs_tile,
      stringsAsFactors = FALSE
    ))
  }
  
  return(scene_info)
}

#' Select best scenes based on quality criteria
#' @param scene_info Scene information dataframe
#' @param items Original STAC items
#' @param cloud_cover_threshold Maximum cloud cover threshold
select_best_scenes <- function(scene_info, items, cloud_cover_threshold, max_scenes = 20) {
  
  cat("🎯 Selecting best quality scenes...\n")
  
  # Filter by cloud cover
  cloud_covers <- scene_info$cloud_cover
  valid_indices <- which(cloud_covers <= cloud_cover_threshold & !is.na(cloud_covers))
  
  if (length(valid_indices) == 0) {
    best_available <- min(cloud_covers, na.rm = TRUE)
    stop(paste0("No scenes found with cloud cover ≤", cloud_cover_threshold, "%. ",
                "Best available scene has ", round(best_available, 1), "% cloud cover. ",
                "Consider increasing cloud cover threshold."))
  }
  
  # Calculate quality scores
  usable_scenes <- scene_info[valid_indices, ]
  
  usable_scenes$quality_score <- sapply(1:nrow(usable_scenes), function(i) {
    # Cloud cover component (lower is better)
    cloud_score <- if (is.na(usable_scenes$cloud_cover[i])) {
      100  # Worst score for missing data
    } else {
      usable_scenes$cloud_cover[i]
    }
    
    # Data coverage component (higher coverage is better)
    coverage_score <- if (is.na(usable_scenes$data_coverage[i])) {
      0  # Assume 100% coverage if unknown
    } else {
      100 - usable_scenes$data_coverage[i]
    }
    
    # Composite score (lower is better)
    cloud_score + (coverage_score * 0.1)
  })
  
  # Sort by quality and limit scenes
  usable_scenes <- usable_scenes[order(usable_scenes$quality_score), ]
  max_scenes <- min(max_scenes, nrow(usable_scenes))
  selected_scenes <- usable_scenes[1:max_scenes, ]
  
  # Update items to match selected scenes
  selected_indices <- valid_indices[order(usable_scenes$quality_score)[1:max_scenes]]
  items$features <- items$features[selected_indices]
  
  # Find best scene
  best_scene_info <- selected_scenes[1, ]
  
  cat("🏆 Selected scenes summary:\n")
  cat("  Total selected:", max_scenes, "\n")
  cat("  Best scene date:", best_scene_info$date, "\n")
  cat("  Best scene cloud cover:", round(best_scene_info$cloud_cover, 1), "%\n")
  cat("  Best scene MGRS tile:", best_scene_info$mgrs_tile, "\n")
  
  return(list(
    selected_scenes = selected_scenes,
    best_scene_info = best_scene_info,
    items = items
  ))
}

# =============================================================================
# MODULE 5: URL SIGNING
# =============================================================================

#' Sign Microsoft Planetary Computer URLs for authentication
#' @param items STAC items to sign
sign_microsoft_pc_urls <- function(items) {
  
  cat("🔐 Signing Microsoft PC URLs...\n")
  
  if (length(items$features) == 0) {
    cat("⚠️ No items to sign\n")
    return(items)
  }
  
  tryCatch({
    # Check if signing function exists
    if (!exists("sign_planetary_computer", mode = "function")) {
      cat("⚠️ sign_planetary_computer function not found, URLs may not work\n")
      return(items)
    }
    
    # Use rstac's built-in signing function
    signed_items <- items_sign(items, sign_fn = sign_planetary_computer())
    
    cat("✅ Successfully signed", length(signed_items$features), "items\n")
    
    # Verify signing worked
    if (length(signed_items$features) > 0) {
      first_item <- signed_items$features[[1]]
      if (!is.null(first_item$assets) && length(first_item$assets) > 0) {
        first_asset <- first_item$assets[[1]]
        if (!is.null(first_asset$href)) {
          has_auth <- grepl("sig=|se=|token|sp=", first_asset$href, ignore.case = TRUE)
          if (has_auth) {
            cat("🔍 URL authentication confirmed\n")
          } else {
            cat("⚠️ URLs may not be properly signed\n")
          }
        }
      }
    }
    
    return(signed_items)
    
  }, error = function(e) {
    cat("❌ URL signing failed:", e$message, "\n")
    cat("🔄 Proceeding with unsigned URLs (may cause access issues)\n")
    return(items)
  })
}

# =============================================================================
# MODULE 6: DATA PROCESSING
# =============================================================================

#' Process Sentinel-2 data using gdalcubes
#' @param items Signed STAC items
#' @param spatial_info Spatial boundary information
#' @param best_scene_info Information about the best scene
#' @param resolution Processing resolution
#' @param cloud_cover_threshold Cloud cover threshold for filtering
process_sentinel2_data <- function(items, spatial_info, best_scene_info,
                                   resolution, cloud_cover_threshold) {
  
  cat("🛰️ Processing Sentinel-2 data...\n")
  
  # Microsoft PC asset names
  assets <- c("B02", "B03", "B04", "B08", "B11", "B12", "SCL")
  cat("📊 Using assets:", paste(assets, collapse = ", "), "\n")
  
  tryCatch({
    # Create STAC image collection
    s2_collection <- stac_image_collection(
      items$features,
      asset_names = assets,
      property_filter = function(x) {
        x[["eo:cloud_cover"]] < cloud_cover_threshold
      }
    )
    
    # Create cube view for best scene (single scene processing)
    best_date <- best_scene_info$date
    v_best <- cube_view(
      srs = paste0("EPSG:", spatial_info$target_crs),
      dx = resolution,
      dy = resolution,
      dt = "P1D",
      aggregation = "first",
      resampling = "average",
      extent = list(
        t0 = best_date,
        t1 = best_date,
        left = spatial_info$bbox_utm["xmin"],
        right = spatial_info$bbox_utm["xmax"],
        top = spatial_info$bbox_utm["ymax"],
        bottom = spatial_info$bbox_utm["ymin"]
      )
    )
    
    # Create data cube
    cube_best <- raster_cube(s2_collection, v_best)
    
    # Calculate indices with quality mask
    quality_mask <- "((SCL >= 3) & (SCL <= 7))"
    
    cat("🧮 Calculating vegetation indices...\n")
    
    indices_cube <- apply_pixel(cube_best,
                                expr = c(
                                  paste0("(B08-B04)/(B08+B04) * ", quality_mask),                           # NDVI
                                  paste0("((B11+B04)-(B08+B02))/((B11+B04)+(B08+B02)) * ", quality_mask), # BSI
                                  paste0("(B02*10000)/(B03*B04) * ", quality_mask),                        # SOCI
                                  paste0("(B11*10000)/B12 * ", quality_mask),                              # CMR
                                  paste0("sqrt((B04*B04 + B08*B08)/2) * 10000 * ", quality_mask)           # SBI
                                ),
                                names = c("ndvi", "bsi", "soci", "cmr", "sbi")
    )
    
    # Convert to terra raster
    indices_raster <- st_as_stars(indices_cube) %>% rast()
    
    # Extract individual layers
    ndvi_raster <- indices_raster[[1]]
    bsi_raster <- indices_raster[[2]]
    soci_raster <- indices_raster[[3]]
    cmr_raster <- indices_raster[[4]]
    sbi_raster <- indices_raster[[5]]
    
    # Set proper names
    names(ndvi_raster) <- "ndvi"
    names(bsi_raster) <- "bsi"
    names(soci_raster) <- "soci"
    names(cmr_raster) <- "cmr"
    names(sbi_raster) <- "sbi"
    
    cat("✅ Data processing completed successfully\n")
    
    return(list(
      ndvi_raster = ndvi_raster,
      bsi_raster = bsi_raster,
      soci_raster = soci_raster,
      cmr_raster = cmr_raster,
      sbi_raster = sbi_raster,
      cube = cube_best,
      quality_mask = quality_mask
    ))
    
  }, error = function(e) {
    stop("Failed to process Sentinel-2 data: ", e$message)
  })
}

# =============================================================================
# MODULE 7: QUALITY ANALYSIS
# =============================================================================

#' Analyze Scene Classification Layer (SCL) quality
#' @param items STAC items
#' @param spatial_info Spatial boundary information
#' @param best_scene_info Best scene information
#' @param cloud_cover_threshold Cloud cover threshold
analyze_scl_quality <- function(items, spatial_info, best_scene_info, cloud_cover_threshold) {
  
  cat("🔍 Analyzing Scene Classification Layer quality...\n")
  
  # SCL category definitions
  scl_categories <- list(
    "0" = "No Data", "1" = "Saturated/defective", "2" = "Dark areas",
    "3" = "Cloud shadows", "4" = "Vegetation", "5" = "Not vegetated",
    "6" = "Water", "7" = "Unclassified", "8" = "Cloud medium",
    "9" = "Cloud high", "10" = "Thin cirrus", "11" = "Snow/ice"
  )
  
  tryCatch({
    best_date <- best_scene_info$date
    
    # Create view for SCL extraction
    v_scl <- cube_view(
      srs = paste0("EPSG:", spatial_info$target_crs),
      dx = 10, dy = 10,  # Use 10m for SCL
      dt = "P1D",
      aggregation = "first",
      resampling = "near",  # Nearest neighbor for categorical data
      extent = list(
        t0 = best_date, t1 = best_date,
        left = spatial_info$bbox_utm["xmin"],
        right = spatial_info$bbox_utm["xmax"],
        top = spatial_info$bbox_utm["ymax"],
        bottom = spatial_info$bbox_utm["ymin"]
      )
    )
    
    # Create SCL collection
    scl_collection <- stac_image_collection(
      items$features,
      asset_names = "SCL",
      property_filter = function(x) {
        x[["eo:cloud_cover"]] < cloud_cover_threshold
      }
    )
    
    # Create SCL cube
    scl_cube <- raster_cube(scl_collection, v_scl)
    scl_raster <- st_as_stars(scl_cube) %>% rast()
    
    # Analyze SCL values
    scl_values <- values(scl_raster, na.rm = FALSE)
    total_pixels <- length(scl_values)
    
    # Create summary statistics
    scl_summary <- data.frame(
      SCL_Code = integer(), Category = character(),
      Pixel_Count = integer(), Percentage = numeric(),
      stringsAsFactors = FALSE
    )
    
    for (scl_code in 0:11) {
      count <- sum(scl_values == scl_code, na.rm = TRUE)
      percentage <- (count / total_pixels) * 100
      
      if (count > 0) {
        scl_summary <- rbind(scl_summary, data.frame(
          SCL_Code = scl_code,
          Category = scl_categories[[as.character(scl_code)]],
          Pixel_Count = count,
          Percentage = round(percentage, 2),
          stringsAsFactors = FALSE
        ))
      }
    }
    
    # Calculate quality statistics
    good_quality_codes <- c(4, 5, 6)  # Vegetation, Not vegetated, Water
    good_pixels <- sum(scl_values %in% good_quality_codes, na.rm = TRUE)
    good_pct <- (good_pixels / total_pixels) * 100
    
    # Quality assessment
    quality_assessment <- if (good_pct > 70) "Excellent" else
      if (good_pct > 50) "Good" else
        if (good_pct > 30) "Fair" else "Poor"
    
    cat("📊 SCL Quality Summary:\n")
    cat("  Good quality pixels:", round(good_pct, 1), "%\n")
    cat("  Overall assessment:", quality_assessment, "\n")
    
    return(list(
      scl_summary = scl_summary,
      scl_raster = scl_raster,
      quality_stats = list(
        total_pixels = total_pixels,
        good_pixels = good_pixels,
        good_percentage = good_pct,
        quality_assessment = quality_assessment
      )
    ))
    
  }, error = function(e) {
    cat("⚠️ SCL analysis failed:", e$message, "\n")
    return(NULL)
  })
}

#' Calculate data quality metrics for processed indices
#' @param processed_data Processed raster data
calculate_data_quality_metrics <- function(processed_data) {
  
  cat("📊 Calculating data quality metrics...\n")
  
  processed_quality <- list()
  
  for (layer_name in c("ndvi", "bsi", "soci", "cmr", "sbi")) {
    layer_raster <- processed_data[[paste0(layer_name, "_raster")]]
    layer_values <- values(layer_raster, na.rm = FALSE)
    
    total_pixels <- length(layer_values)
    valid_pixels <- sum(!is.na(layer_values) & is.finite(layer_values))
    valid_percentage <- round((valid_pixels / total_pixels) * 100, 1)
    
    if (valid_pixels > 0) {
      finite_values <- layer_values[is.finite(layer_values)]
      value_range <- range(finite_values, na.rm = TRUE)
      value_mean <- mean(finite_values, na.rm = TRUE)
      value_sd <- sd(finite_values, na.rm = TRUE)
    } else {
      value_range <- c(NA, NA)
      value_mean <- NA
      value_sd <- NA
    }
    
    processed_quality[[layer_name]] <- list(
      total_pixels = total_pixels,
      valid_pixels = valid_pixels,
      valid_percentage = valid_percentage,
      value_range = value_range,
      value_mean = round(value_mean, 4),
      value_sd = round(value_sd, 4)
    )
  }
  
  return(processed_quality)
}

# =============================================================================
# MODULE 8: CACHING
# =============================================================================

#' Check for cached results
#' @param cache_params Parameters for cache key generation
#' @param session_cache_dir Session cache directory
check_cache <- function(cache_params, session_cache_dir) {
  
  if (is.null(session_cache_dir)) return(NULL)
  
  cache_key <- digest(cache_params, algo = "md5")
  cache_file <- file.path(session_cache_dir, paste0("satellite_", cache_key, ".rds"))
  
  if (file.exists(cache_file)) {
    tryCatch({
      # Simple age check (24 hours)
      file_age <- difftime(Sys.time(), file.info(cache_file)$mtime, units = "hours")
      if (file_age < 24) {
        cached_result <- readRDS(cache_file)
        cat("📦 Loaded from session cache\n")
        return(cached_result)
      } else {
        cat("⏰ Cache expired, processing fresh data\n")
        file.remove(cache_file)
      }
    }, error = function(e) {
      try(file.remove(cache_file), silent = TRUE)
    })
  }
  
  return(NULL)
}

#' Save results to cache
#' @param result Processing results
#' @param cache_params Parameters for cache key generation
#' @param session_cache_dir Session cache directory
save_to_cache <- function(result, cache_params, session_cache_dir) {
  
  if (is.null(session_cache_dir)) return(FALSE)
  
  tryCatch({
    cache_key <- digest(cache_params, algo = "md5")
    cache_file <- file.path(session_cache_dir, paste0("satellite_", cache_key, ".rds"))
    
    saveRDS(result, cache_file)
    cat("💾 Results cached successfully\n")
    return(TRUE)
    
  }, error = function(e) {
    cat("⚠️ Cache save failed (non-critical):", e$message, "\n")
    return(FALSE)
  })
}

# =============================================================================
# MAIN FUNCTION: MODULAR SENTINEL-2 PROCESSING
# =============================================================================

#' Enhanced modular Sentinel-2 processing function
#' @param lon Longitude of center point
#' @param lat Latitude of center point
#' @param bbox_size_km Size of bounding box in kilometers (default: 2)
#' @param start_date Character string in YYYY-MM-DD format (default: "2024-05-01")
#' @param end_date Character string in YYYY-MM-DD format (default: "2024-10-01")
#' @param resolution Spatial resolution in meters (default: 5)
#' @param cloud_cover_threshold Maximum cloud cover percentage (default: 5)
#' @param session_id Session identifier for cache isolation
#' @param progress Progress function for Shiny
#' @param use_cache Whether to use caching (default: TRUE)
#' @return List with NDVI, indices, and comprehensive scene quality information
get_sentinel2_data_production <- function(lon, lat,
                                          bbox_size_km = 2,
                                          start_date = "2024-05-01",
                                          end_date = "2024-10-01",
                                          resolution = 10,
                                          cloud_cover_threshold = 5,
                                          session_id = NULL,
                                          progress = NULL,
                                          use_cache = TRUE) {
  
  cat("🛰️ MODULAR SENTINEL-2 PROCESSING\n")
  cat(paste(rep("=", 50), collapse = ""), "\n\n")
  
  # Progress tracking
  if (is.function(progress)) progress(detail = "Initializing processing...", value = 0.05)
  
  # MODULE 1: Input validation and setup
  validate_inputs(lon, lat, bbox_size_km, start_date, end_date,
                  resolution, cloud_cover_threshold)
  session_cache_dir <- setup_processing_environment(session_id)
  
  # Cache parameters
  cache_params <- list(
    lat, lon, bbox_size_km, start_date, end_date,
    resolution, cloud_cover_threshold, "modular_microsoft_pc_v2"
  )
  
  # Check cache if enabled
  if (use_cache) {
    cached_result <- check_cache(cache_params, session_cache_dir)
    if (!is.null(cached_result)) {
      if (is.function(progress)) progress(detail = "Loaded from cache", value = 1.0)
      return(cached_result)
    }
  }
  
  if (is.function(progress)) progress(detail = "Creating spatial boundaries...", value = 0.1)
  
  # MODULE 2: Spatial processing
  spatial_info <- create_spatial_boundaries(lon, lat, bbox_size_km)
  
  if (is.function(progress)) progress(detail = "Connecting to data source...", value = 0.2)
  
  # MODULE 3: STAC connection and search
  stac_obj <- create_stac_connection()
  items <- search_sentinel2_data(stac_obj, spatial_info$bbox_wgs84,
                                 start_date, end_date, cloud_cover_threshold)
  
  if (is.function(progress)) progress(detail = "Analyzing scenes...", value = 0.3)
  
  # MODULE 4: Scene analysis and selection
  scene_info <- extract_scene_information(items)
  selection_result <- select_best_scenes(scene_info, items, cloud_cover_threshold)
  
  if (is.function(progress)) progress(detail = "Preparing data access...", value = 0.4)
  
  # MODULE 5: URL signing
  signed_items <- sign_microsoft_pc_urls(selection_result$items)
  
  if (is.function(progress)) progress(detail = "Processing satellite data...", value = 0.5)
  
  # MODULE 6: Data processing
  processed_data <- process_sentinel2_data(signed_items, spatial_info,
                                           selection_result$best_scene_info,
                                           resolution, cloud_cover_threshold)
  
  if (is.function(progress)) progress(detail = "Analyzing data quality...", value = 0.8)
  
  # MODULE 7: Quality analysis
  scl_analysis <- analyze_scl_quality(signed_items, spatial_info,
                                      selection_result$best_scene_info,
                                      cloud_cover_threshold)
  processed_quality <- calculate_data_quality_metrics(processed_data)
  
  if (is.function(progress)) progress(detail = "Finalizing results...", value = 0.9)
  
  # Calculate comprehensive scene quality statistics
  scene_quality_stats <- calculate_scene_quality_stats(scene_info, start_date, end_date)
  
  # Create comprehensive result object
  result <- list(
    # Raster data
    ndvi_raster = processed_data$ndvi_raster,
    bsi_raster = processed_data$bsi_raster,
    soci_raster = processed_data$soci_raster,
    cmr_raster = processed_data$cmr_raster,
    sbi_raster = processed_data$sbi_raster,
    
    # Processing metadata
    best_date = selection_result$best_scene_info$date,
    cloud_cover = selection_result$best_scene_info$cloud_cover,
    bbox_utm = spatial_info$bbox_utm,
    bbox_size_km = bbox_size_km,
    utm_crs = spatial_info$target_crs,
    method = "Modular_Microsoft_PC_v2",
    date_range = paste(start_date, "to", end_date),
    scene_count = length(signed_items$features),
    session_id = session_id,
    
    # Enhanced scene quality information
    scene_quality_stats = scene_quality_stats,
    all_scenes_info = scene_info,
    selected_scenes_info = selection_result$selected_scenes,
    best_scene_info = selection_result$best_scene_info,
    processed_quality = processed_quality,
    scl_analysis = scl_analysis,
    
    # Processing parameters
    processing_params = list(
      cloud_cover_threshold = cloud_cover_threshold,
      resolution = resolution,
      quality_mask = processed_data$quality_mask,
      processing_date = Sys.time(),
      stac_endpoint = "Microsoft Planetary Computer",
      asset_names = c("B02", "B03", "B04", "B08", "B11", "B12", "SCL"),
      modular_version = "2.0"
    )
  )
  
  # Save to cache if enabled
  if (use_cache) {
    save_to_cache(result, cache_params, session_cache_dir)
  }
  
  if (is.function(progress)) progress(detail = "Processing complete!", value = 1.0)
  
  # Final summary
  print_processing_summary(result)
  
  return(result)
}

# =============================================================================
# HELPER FUNCTIONS FOR STATISTICS AND REPORTING
# =============================================================================

#' Calculate comprehensive scene quality statistics
#' @param scene_info Scene information dataframe
#' @param start_date Start date
#' @param end_date End date
calculate_scene_quality_stats <- function(scene_info, start_date, end_date) {
  
  total_scenes <- nrow(scene_info)
  valid_cloud_data <- !is.na(scene_info$cloud_cover)
  valid_coverage_data <- !is.na(scene_info$data_coverage)
  
  scene_quality_stats <- list(
    total_scenes_found = total_scenes,
    date_range_requested = paste(start_date, "to", end_date),
    date_range_actual = if (total_scenes > 0) {
      valid_dates <- scene_info$date[scene_info$date != "unknown"]
      if (length(valid_dates) > 0) {
        paste(min(valid_dates), "to", max(valid_dates))
      } else "No valid dates"
    } else "No scenes",
    
    # Cloud cover statistics
    cloud_cover_mean = if (sum(valid_cloud_data) > 0) {
      round(mean(scene_info$cloud_cover[valid_cloud_data]), 1)
    } else NA,
    cloud_cover_min = if (sum(valid_cloud_data) > 0) {
      round(min(scene_info$cloud_cover[valid_cloud_data]), 1)
    } else NA,
    cloud_cover_max = if (sum(valid_cloud_data) > 0) {
      round(max(scene_info$cloud_cover[valid_cloud_data]), 1)
    } else NA,
    cloud_cover_median = if (sum(valid_cloud_data) > 0) {
      round(median(scene_info$cloud_cover[valid_cloud_data]), 1)
    } else NA,
    
    # Scene quality categories
    excellent_scenes = sum(scene_info$cloud_cover <= 5, na.rm = TRUE),
    good_scenes = sum(scene_info$cloud_cover <= 15, na.rm = TRUE),
    fair_scenes = sum(scene_info$cloud_cover <= 30, na.rm = TRUE),
    poor_scenes = sum(scene_info$cloud_cover > 30, na.rm = TRUE),
    
    # Data coverage statistics
    data_coverage_mean = if (sum(valid_coverage_data) > 0) {
      round(mean(scene_info$data_coverage[valid_coverage_data]), 1)
    } else NA,
    
    # Processing levels and metadata
    processing_levels = unique(scene_info$processing_level[!is.na(scene_info$processing_level)]),
    platforms = unique(scene_info$platform[!is.na(scene_info$platform)]),
    mgrs_tiles = unique(scene_info$mgrs_tile[scene_info$mgrs_tile != "unknown"])
  )
  
  return(scene_quality_stats)
}

#' Print comprehensive processing summary
#' @param result Processing results
print_processing_summary <- function(result) {
  
  cat("\n✅ PROCESSING COMPLETE\n")
  cat(paste(rep("=", 40), collapse = ""), "\n")
  
  cat("📊 Scene Summary:\n")
  cat("  Total scenes found:", result$scene_quality_stats$total_scenes_found, "\n")
  cat("  Excellent scenes (≤5% clouds):", result$scene_quality_stats$excellent_scenes, "\n")
  cat("  Good scenes (≤15% clouds):", result$scene_quality_stats$good_scenes, "\n")
  cat("  Selected scene date:", result$best_date, "\n")
  cat("  Selected scene cloud cover:", round(result$cloud_cover, 1), "%\n")
  
  cat("\n📊 Data Quality:\n")
  cat("  NDVI coverage:", result$processed_quality$ndvi$valid_percentage, "%\n")
  cat("  NDVI range:", round(result$processed_quality$ndvi$value_range[1], 3),
      "to", round(result$processed_quality$ndvi$value_range[2], 3), "\n")
  
  # SCL quality if available
  if (!is.null(result$scl_analysis) && !is.null(result$scl_analysis$quality_stats)) {
    scl_stats <- result$scl_analysis$quality_stats
    cat("  Scene classification quality:", scl_stats$quality_assessment, "\n")
    cat("  Good quality pixels:", round(scl_stats$good_percentage, 1), "%\n")
  }
  
  cat("\n🛰️ Processing Info:\n")
  cat("  Method:", result$method, "\n")
  cat("  Resolution:", result$processing_params$resolution, "meters\n")
  cat("  UTM CRS:", result$utm_crs, "\n")
  cat("  Processing time:", format(result$processing_params$processing_date, "%Y-%m-%d %H:%M:%S"), "\n")
  
  cat("\n🎯 Available Data:\n")
  cat("  NDVI (Normalized Difference Vegetation Index)\n")
  cat("  BSI (Bare Soil Index)\n")
  cat("  SOCI (Soil Color Index)\n")
  cat("  CMR (Clay Mineral Ratio)\n")
  cat("  SBI (Soil Brightness Index)\n")
  
  cat("\n💡 Usage Examples:\n")
  cat("  plot(result$ndvi_raster)  # Plot NDVI\n")
  cat("  hist(result$ndvi_raster)  # NDVI histogram\n")
  cat("  summary(result$scene_quality_stats)  # Scene statistics\n")
}


# =============================================================================
# PRODUCTION-OPTIMIZED TERRAIN DATA PROCESSING
# =============================================================================

#' Production-optimized terrain processing with fast fallback
#' @param lon Longitude of center point
#' @param lat Latitude of center point
#' @param bbox_size_km Size of bounding box in kilometers
#' @param resolution Target resolution in meters
#' @param session_id Session identifier
#' @param progress Progress function for Shiny
#' @return List with terrain rasters
download_terrain_production <- function(lon, lat, bbox_size_km = 5,
                                        resolution = 10,
                                        session_id = NULL,
                                        progress = NULL) {
  
  # Fast input validation
  if (!is.numeric(lat) || !is.numeric(lon) || abs(lat) > 90 || abs(lon) > 180) {
    stop("Invalid coordinates")
  }
  
  if (bbox_size_km <= 0 || bbox_size_km > 100) {
    stop("Invalid bbox size")
  }
  
  if (is.function(progress)) progress(detail = "Initializing terrain processing...", value = 0.1)
  
  # Session-specific cache
  session_cache_dir <- get_session_cache_dir(session_id)
  cache_key <- digest(list(lat, lon, bbox_size_km, resolution), algo = "md5")
  cache_file <- file.path(session_cache_dir, paste0("terrain_", cache_key, ".rds"))
  
  # Fast cache check
  if (validate_cache_fast(cache_file)) {
    tryCatch({
      cached_result <- readRDS(cache_file)
      if (!is.null(cached_result$terrain_raster) &&
          inherits(cached_result$terrain_raster, "SpatRaster")) {
        if (is.function(progress)) progress(detail = "Loaded terrain from session cache", value = 1.0)
        cat("📦 Loaded terrain from session cache\n")
        return(cached_result)
      }
    }, error = function(e) {
      try(file.remove(cache_file), silent = TRUE)
    })
  }
  
  if (is.function(progress)) progress(detail = "Downloading terrain data...", value = 0.3)
  
  # Fast terrain download with immediate fallback
  tryCatch({
    cat("🌍 Downloading REAL terrain data from USGS sources...\n")
    
    center_wgs <- st_sfc(st_point(c(lon, lat)), crs = 4326)
    
    # USGS terrain data URLs - verified working sources
    urls <- paste0(
      "/vsicurl/https://storage.googleapis.com/dsm-ft-stedus-30m-public/",
      c("twi.tif", "sl_2.tif", "aspct_2.tif", "tri_2.tif")
    )
    
    cat("📡 Terrain data sources:\n")
    for (i in seq_along(urls)) {
      cat("  ", i, ":", basename(urls[i]), "\n")
    }
    
    if (is.function(progress)) progress(detail = "Connecting to terrain sources...", value = 0.5)
    
    # Create virtual mosaic with enhanced error checking
    cat("📡 Creating terrain data connection...\n")
    
    # Test connection to each URL first
    cat("🔍 Testing terrain data availability:\n")
    valid_urls <- c()
    for (i in seq_along(urls)) {
      tryCatch({
        test_raster <- rast(urls[i])
        if (!is.null(test_raster) && ncell(test_raster) > 0) {
          cat("  ✅", basename(urls[i]), "- Available\n")
          valid_urls <- c(valid_urls, urls[i])
        } else {
          cat("  ❌", basename(urls[i]), "- Empty or invalid\n")
        }
      }, error = function(e) {
        cat("  ❌", basename(urls[i]), "- Connection failed:", e$message, "\n")
      })
    }
    
    if (length(valid_urls) == 0) {
      stop("No terrain data sources are accessible")
    }
    
    cat("✅ Found", length(valid_urls), "accessible terrain sources\n")
    
    # Create stack from valid URLs only
    cov_stack <- rast(valid_urls)
    
    if (is.null(cov_stack) || nlyr(cov_stack) == 0) {
      stop("Failed to create terrain data stack")
    }
    
    cat("✅ Terrain stack created successfully\n")
    cat("  Layers:", nlyr(cov_stack), "\n")
    cat("  Names:", paste(names(cov_stack), collapse = ", "), "\n")
    cat("  CRS:", as.character(crs(cov_stack)), "\n")
    cat("  Global extent:", paste(round(as.vector(ext(cov_stack)), 0), collapse = ", "), "\n")
    
    # Transform center to terrain CRS
    cat("🔄 Transforming coordinates to terrain CRS...\n")
    center_pr <- st_transform(center_wgs, crs(cov_stack))
    xy <- st_coordinates(center_pr)[1, ]
    cat("  Center in terrain CRS:", round(xy, 2), "\n")
    
    # Compute bbox for extraction
    half_w <- (bbox_size_km * 1000) / 2
    bb <- ext(
      xy[1] - half_w, xy[1] + half_w,
      xy[2] - half_w, xy[2] + half_w
    )
    
    cat("📏 Extraction bbox:", paste(round(as.vector(bb), 0), collapse = ", "), "\n")
    
    # Check if bbox overlaps with terrain data
    terrain_ext <- ext(cov_stack)
    
    # FIXED: Proper overlap detection
    bb_vec <- as.vector(bb)
    terrain_vec <- as.vector(terrain_ext)
    
    cat("🔍 Detailed overlap check:\n")
    cat("  Requested bbox: [", paste(round(bb_vec, 0), collapse = ", "), "]\n")
    cat("  Terrain coverage: [", paste(round(terrain_vec, 0), collapse = ", "), "]\n")
    
    # Check each dimension separately for debugging
    x_overlap <- !(bb_vec[2] < terrain_vec[1] || bb_vec[1] > terrain_vec[2])
    y_overlap <- !(bb_vec[4] < terrain_vec[3] || bb_vec[3] > terrain_vec[4])
    
    cat("  X overlap check:", x_overlap, "\n")
    cat("    Requested X: [", bb_vec[1], "to", bb_vec[2], "]\n")
    cat("    Terrain X: [", terrain_vec[1], "to", terrain_vec[2], "]\n")
    cat("  Y overlap check:", y_overlap, "\n")
    cat("    Requested Y: [", bb_vec[3], "to", bb_vec[4], "]\n")
    cat("    Terrain Y: [", terrain_vec[3], "to", terrain_vec[4], "]\n")
    
    bbox_overlaps <- x_overlap && y_overlap
    
    if (!bbox_overlaps) {
      cat("❌ Location is outside terrain data coverage\n")
      
      # Return NULL gracefully instead of throwing error
      return(list(
        terrain_raster = NULL,
        bbox_utm = bbox_utm_calc,
        bbox_size_km = bbox_size_km,
        utm_crs = target_crs,
        method = "No_Coverage",
        layer_count = 0,
        session_id = session_id,
        data_source = "None - Outside Coverage Area"
      ))
    }
    
    cat("✅ Bbox overlaps with terrain data coverage\n")
    
    if (is.function(progress)) progress(detail = "Extracting terrain data...", value = 0.7)
    
    # Extract terrain data with validation
    cat("✂️ Cropping terrain data to study area...\n")
    cropped <- terra::crop(cov_stack, bb)
    
    if (is.null(cropped) || nlyr(cropped) == 0) {
      stop("Terrain cropping failed - no data extracted")
    }
    
    cat("✅ Terrain data extracted successfully\n")
    cat("  Cropped layers:", nlyr(cropped), "\n")
    cat("  Cropped extent:", paste(round(as.vector(ext(cropped)), 2), collapse = ", "), "\n")
    
    # Set proper layer names based on original URLs
    layer_names <- c()
    for (url in valid_urls) {
      if (grepl("twi", url)) layer_names <- c(layer_names, "twi")
      else if (grepl("sl_", url)) layer_names <- c(layer_names, "slope")
      else if (grepl("aspct", url)) layer_names <- c(layer_names, "aspect")
      else if (grepl("tri", url)) layer_names <- c(layer_names, "tri")
      else if (grepl("tpi", url)) layer_names <- c(layer_names, "tpi")
      else if (grepl("relelev", url)) layer_names <- c(layer_names, "relelev")
      else layer_names <- c(layer_names, paste0("terrain_", length(layer_names) + 1))
    }
    
    if (nlyr(cropped) == length(layer_names)) {
      names(cropped) <- layer_names
    } else {
      names(cropped) <- paste0("terrain_", 1:nlyr(cropped))
    }
    
    cat("📊 Final terrain layer names:", paste(names(cropped), collapse = ", "), "\n")
    
    # CRITICAL: Validate each terrain layer has real data
    cat("🧪 Validating real terrain data quality:\n")
    valid_layers <- list()
    
    for (i in 1:nlyr(cropped)) {
      layer_name <- names(cropped)[i]
      single_layer <- cropped[[i]]
      
      # Extract sample to test data quality
      sample_vals <- values(single_layer, row = 1, nrows = min(100, nrow(single_layer)))
      all_vals <- values(single_layer, na.rm = TRUE)
      finite_vals <- all_vals[is.finite(all_vals)]
      
      cat("  Testing", layer_name, ":\n")
      cat("    Total cells:", ncell(single_layer), "\n")
      cat("    Sample size:", length(sample_vals), "\n")
      cat("    Valid in sample:", sum(!is.na(sample_vals) & is.finite(sample_vals)), "\n")
      cat("    Total valid:", length(finite_vals), "\n")
      
      if (length(finite_vals) > 0) {
        value_range <- range(finite_vals)
        cat("    Value range:", round(value_range, 3), "\n")
        
        # Check if values are reasonable for terrain data
        is_reasonable <- TRUE
        if (layer_name == "twi" && (value_range[1] < 0 || value_range[2] > 30)) {
          cat("    ⚠️ TWI values outside expected range (0-30)\n")
        } else if (layer_name == "slope" && (value_range[1] < 0 || value_range[2] > 90)) {
          cat("    ⚠️ Slope values outside expected range (0-90 degrees)\n")
        } else if (layer_name == "aspect" && (value_range[1] < 0 || value_range[2] > 360)) {
          cat("    ⚠️ Aspect values outside expected range (0-360 degrees)\n")
        }
        
        if (is_reasonable && length(finite_vals) > ncell(single_layer) * 0.1) {
          valid_layers[[layer_name]] <- single_layer
          cat("    ✅ REAL terrain layer", layer_name, "is valid\n")
        } else {
          cat("    ❌ REAL terrain layer", layer_name, "failed quality check\n")
        }
      } else {
        cat("    ❌ REAL terrain layer", layer_name, "has no valid data\n")
      }
    }
    
    if (length(valid_layers) == 0) {
      stop("No terrain layers contain valid real data in the specified area")
    }
    
    cat("✅ Validated", length(valid_layers), "/", nlyr(cropped), "real terrain layers\n")
    
    # Reconstruct stack with only valid layers
    if (length(valid_layers) < nlyr(cropped)) {
      cat("🔄 Keeping only validated terrain layers\n")
      cropped <- rast(valid_layers)
    }
    
    # Resolution adjustment if needed (but preserve real data)
    current_res <- res(cropped)[1]
    if (abs(current_res - resolution) > 5) {  # Only resample if significantly different
      cat("📏 Adjusting resolution from", round(current_res), "m to", resolution, "m\n")
      
      # Create template at target resolution
      template <- cropped[[1]]
      res(template) <- resolution
      
      # Resample preserving data integrity
      cropped_resampled <- resample(cropped, template, method = "bilinear")
      
      # Validate resampled data
      cat("🧪 Validating data after resampling:\n")
      data_preserved <- TRUE
      for (i in 1:nlyr(cropped_resampled)) {
        layer_name <- names(cropped_resampled)[i]
        test_vals <- values(cropped_resampled[[i]], na.rm = TRUE)
        finite_vals <- test_vals[is.finite(test_vals)]
        
        if (length(finite_vals) > ncell(cropped_resampled[[i]]) * 0.1) {
          cat("  ✅", layer_name, "preserved data after resampling\n")
        } else {
          cat("  ❌", layer_name, "lost data during resampling\n")
          data_preserved <- FALSE
        }
      }
      
      if (data_preserved) {
        cropped <- cropped_resampled
        cat("✅ Resolution adjustment successful\n")
      } else {
        cat("⚠️ Resampling degraded data quality - using original resolution\n")
      }
    }
    
    # Calculate final metadata
    utm_zone <- floor((lon + 180) / 6) + 1
    target_crs <- ifelse(lat >= 0, 32600 + utm_zone, 32700 + utm_zone)
    bbox_utm_calc <- as.vector(ext(cropped))
    names(bbox_utm_calc) <- c("xmin", "xmax", "ymin", "ymax")
    
    terrain_result <- list(
      terrain_raster = cropped,
      bbox_utm = bbox_utm_calc,
      bbox_size_km = bbox_size_km,
      utm_crs = target_crs,
      resolution = res(cropped)[1],
      method = "Real_USGS_COG_Data",
      layer_count = nlyr(cropped),
      session_id = session_id,
      data_source = "USGS Terrain Database",
      validation_passed = TRUE
    )
    
    # Cache result
    tryCatch({
      saveRDS(terrain_result, cache_file)
      cat("💾 Real terrain data cached for session:", session_id, "\n")
    }, error = function(e) {
      cat("⚠️ Cache save failed (non-critical):", e$message, "\n")
    })
    
    if (is.function(progress)) progress(detail = "Real terrain processing complete!", value = 1.0)
    cat("✅ REAL terrain data processed successfully -", nlyr(cropped), "layers\n")
    cat("📊 Data source: USGS terrain database\n")
    cat("🌍 Coverage verified for location:", lat, ",", lon, "\n")
    
    return(terrain_result)
    
  }, error = function(e) {
    cat("❌ Real terrain data acquisition failed:", e$message, "\n")
    
    # Provide informative error without synthetic fallback
    if (grepl("outside.*coverage", e$message, ignore.case = TRUE)) {
      cat("🌍 LOCATION ISSUE: This location appears to be outside terrain data coverage\n")
      cat("📍 Terrain data is primarily available for:\n")
      cat("  - Continental United States\n")
      cat("  - Some US territories\n")
      cat("🔄 Try a location within the US for terrain data\n")
    } else if (grepl("connection|network|timeout", e$message, ignore.case = TRUE)) {
      cat("🌐 NETWORK ISSUE: Cannot connect to terrain data servers\n")
      cat("🔄 Check internet connection and try again\n")
    } else {
      cat("⚙️ PROCESSING ISSUE:", e$message, "\n")
      cat("🔄 This may be a temporary issue with terrain data processing\n")
    }
    
    # Return NULL instead of synthetic data - let the app handle the absence
    cat("❌ Proceeding without terrain data - only satellite data will be available\n")
    
    if (is.function(progress)) progress(detail = "Terrain unavailable - using satellite only", value = 1.0)
    
    return(NULL)  # No synthetic fallback
  })
}

# =============================================================================
# PRODUCTION MAIN PROCESSING FUNCTION
# =============================================================================

#' Production-optimized bbox processing for multi-user Shiny app
#' @param lat Latitude
#' @param lon Longitude
#' @param bbox_size_km Bounding box size
#' @param target_resolution Target resolution
#' @param include_satellite Include satellite data
#' @param include_terrain Include terrain data
#' @param session_id Shiny session ID for isolation
#' @param progress Progress callback
#' @return SpatRaster with processed layers
process_covariates_production <- function(lat, lon, bbox_size_km,
                                          target_resolution = 10,
                                          cloud_cover_threshold = 20,
                                          include_satellite = TRUE,
                                          include_terrain = TRUE,
                                          start_date = NULL,
                                          end_date = NULL,
                                          session_id = NULL,
                                          progress = NULL) {
  
  # Set default dates if not provided
  if (is.null(start_date)) {
    start_date <- as.character(Sys.Date() - 365)
  }
  if (is.null(end_date)) {
    end_date <- as.character(Sys.Date() - 30)
  }
  
  # Session isolation
  if (is.null(session_id)) {
    session_id <- paste0("user_", sample(1000:9999, 1))
  }
  
  cat("🚀 Production processing - Session:", session_id, "\n")
  cat("📍 Location:", lat, ",", lon, "- Bbox:", bbox_size_km, "km\n")
  cat("📅 Date range:", start_date, "to", end_date, "\n")
  
  # FIXED: Proper progress function that handles both detail and value
  safe_progress <- function(detail = NULL, value = NULL) {
    if (is.function(progress)) {
      tryCatch({
        # Call the progress function with both parameters
        if (!is.null(detail) && !is.null(value)) {
          progress(detail = detail, value = value)
        } else if (!is.null(detail)) {
          progress(detail = detail)
        } else if (!is.null(value)) {
          progress(value = value)
        }
        
        # Also log to console
        if (!is.null(detail)) {
          cat("📊", detail, if (!is.null(value)) paste0(" (", round(value * 100), "%)"), "\n")
        }
      }, error = function(e) {
        # Only log to console if progress update fails
        if (!is.null(detail)) {
          cat("📊", detail, "\n")
        }
      })
    } else {
      # No progress function provided, just log
      if (!is.null(detail)) {
        cat("📊", detail, if (!is.null(value)) paste0(" (", round(value * 100), "%)"), "\n")
      }
    }
  }
  
  safe_progress("Initializing production processing...", 0.05)
  
  # Fast input validation
  if (abs(lat) > 90 || abs(lon) > 180 || bbox_size_km <= 0 || bbox_size_km > 50) {
    stop("Invalid parameters")
  }
  
  # Calculate UTM
  utm_zone <- floor((lon + 180) / 6) + 1
  target_crs <- ifelse(lat >= 0, 32600 + utm_zone, 32700 + utm_zone)
  cat("📍 Using UTM CRS:", target_crs, "\n")
  
  all_layers <- list()
  
  # SATELLITE PROCESSING
  if (include_satellite) {
    safe_progress("Processing satellite data...", 0.2)
    
    tryCatch({
      cat("📡 Processing Sentinel-2 data with custom date range...\n")
      
      satellite_result <- get_sentinel2_data_production(
        lon = lon, lat = lat, bbox_size_km = bbox_size_km,
        start_date = start_date,
        end_date = end_date,
        resolution = target_resolution,
        cloud_cover_threshold = cloud_cover_threshold,
        session_id = session_id,
        progress = safe_progress  # Pass the safe progress function
      )
      
      # Add valid satellite layers
      if (!is.null(satellite_result)) {
        satellite_layers <- c("ndvi_raster", "bsi_raster", "soci_raster", "cmr_raster", "sbi_raster")
        satellite_count <- 0
        
        for (layer_name in satellite_layers) {
          layer_obj <- satellite_result[[layer_name]]
          if (!is.null(layer_obj)) {
            tryCatch({
              if (inherits(layer_obj, "SpatRaster") && ncell(layer_obj) > 0) {
                layer_key <- gsub("_raster", "", layer_name)
                all_layers[[layer_key]] <- layer_obj
                satellite_count <- satellite_count + 1
                cat("✅ Added", layer_name, "\n")
              }
            }, error = function(e) {
              cat("⚠️ Skipped problematic", layer_name, "\n")
            })
          }
        }
        cat("✅ Satellite data processed successfully -", satellite_count, "layers added\n")
        
        # Log quality info
        if (!is.null(satellite_result$scene_quality_stats)) {
          stats <- satellite_result$scene_quality_stats
          cat("📊 Found", stats$total_scenes_found, "scenes,",
              stats$excellent_scenes, "excellent quality\n")
        }
      }
      
    }, error = function(e) {
      cat("❌ Satellite processing failed:", e$message, "\n")
      # Continue with terrain only
    })
  }
  
  # TERRAIN PROCESSING
  if (include_terrain && length(all_layers) < 10) {
    safe_progress("Processing terrain data...", 0.6)
    
    tryCatch({
      cat("🏔️ Attempting to acquire terrain data...\n")
      
      terrain_result <- download_terrain_production(
        lon = lon, lat = lat, bbox_size_km = bbox_size_km,
        resolution = target_resolution,
        session_id = session_id,
        progress = safe_progress
      )
      
      if (!is.null(terrain_result) && !is.null(terrain_result$terrain_raster)) {
        cat("🔍 Processing terrain result with", nlyr(terrain_result$terrain_raster), "layers\n")
        
        terrain_raster <- terrain_result$terrain_raster
        terrain_layer_names <- names(terrain_raster)
        
        # CRITICAL: Check CRS compatibility before processing
        terrain_crs <- crs(terrain_raster)
        
        # Get satellite CRS for comparison (if available)
        satellite_crs <- NULL
        if (length(all_layers) > 0) {
          first_layer <- all_layers[[1]]
          if (inherits(first_layer, "SpatRaster")) {
            satellite_crs <- crs(first_layer)
          }
        }
        
        cat("📊 Terrain CRS:", if (grepl("Albers", terrain_crs)) "NAD83 Albers" else "Other", "\n")
        if (!is.null(satellite_crs)) {
          cat("📡 Satellite CRS:", if (grepl("UTM", satellite_crs)) "UTM" else "Other", "\n")
        }
        
        cat("📊 Terrain layer names from result:", paste(terrain_layer_names, collapse = ", "), "\n")
        
        # Process individual terrain layers with CRS awareness
        terrain_count <- 0
        
        for (i in 1:nlyr(terrain_raster)) {
          layer_name <- terrain_layer_names[i]
          cat("🔍 Processing terrain layer", i, ":", layer_name, "\n")
          
          tryCatch({
            # Extract individual layer
            single_layer <- terrain_raster[[i]]
            
            # Validate layer BEFORE any transformation
            if (!is.null(single_layer) && inherits(single_layer, "SpatRaster") && ncell(single_layer) > 0) {
              # Test for valid data in original CRS
              test_vals <- values(single_layer, na.rm = TRUE)
              finite_vals <- test_vals[is.finite(test_vals)]
              
              if (length(finite_vals) > 0) {
                cat("    📊 Original data valid:", length(finite_vals), "values\n")
                cat("    📊 Original range:", round(range(finite_vals), 3), "\n")
                
                # Map terrain layer names to expected names
                mapped_name <- case_when(
                  grepl("twi", layer_name, ignore.case = TRUE) ~ "twi",
                  grepl("sl_|slope", layer_name, ignore.case = TRUE) ~ "slope",
                  grepl("aspct|aspect", layer_name, ignore.case = TRUE) ~ "aspect",
                  grepl("tri", layer_name, ignore.case = TRUE) ~ "tri",
                  grepl("tpi", layer_name, ignore.case = TRUE) ~ "tpi",
                  grepl("relelev|elev", layer_name, ignore.case = TRUE) ~ "elevation",
                  TRUE ~ layer_name
                )
                
                # Set proper name
                names(single_layer) <- mapped_name
                
                # Add to layers list (CRS alignment will happen in combine_layers_production)
                all_layers[[mapped_name]] <- single_layer
                terrain_count <- terrain_count + 1
                
                cat("    ✅ Added terrain layer:", mapped_name, "\n")
                cat("    📊 Will be aligned during layer combination\n")
                
              } else {
                cat("    ❌ Terrain layer", layer_name, "has no valid data\n")
              }
            } else {
              cat("    ❌ Terrain layer", layer_name, "is invalid or empty\n")
            }
            
          }, error = function(e) {
            cat("    ❌ Error processing terrain layer", layer_name, ":", e$message, "\n")
          })
        }
        
        cat("✅ Terrain data processed successfully -", terrain_count, "layers added\n")
        cat("📊 Total layers now:", length(all_layers), "\n")
        cat("📊 CRS alignment will occur during layer combination\n")
        
      } else {
        cat("⚠️ Terrain result is NULL or has no terrain_raster\n")
      }
      
    }, error = function(e) {
      cat("❌ Terrain processing error:", e$message, "\n")
      cat("🔄 Continuing with satellite data only\n")
    })
  }
  
  # ADDITIONAL FIX: Enhanced layer combination debugging
  safe_progress("Combining layers...", 0.9)
  
  cat("🔍 PRE-COMBINATION DEBUG:\n")
  cat("📊 Total layers to combine:", length(all_layers), "\n")
  cat("📊 Layer names:", paste(names(all_layers), collapse = ", "), "\n")
  
  # Debug each layer before combination
  for (layer_name in names(all_layers)) {
    layer_obj <- all_layers[[layer_name]]
    if (inherits(layer_obj, "SpatRaster")) {
      cat("  ✅", layer_name, "- SpatRaster with", nlyr(layer_obj), "layers\n")
    } else {
      cat("  ❌", layer_name, "- Not a SpatRaster:", class(layer_obj), "\n")
    }
  }
  
  # Combine layers
  if (length(all_layers) == 0) {
    stop("No valid covariate layers were generated")
  }
  
  combined_result <- combine_layers_production(all_layers, session_id)
  
  if (is.null(combined_result)) {
    stop("Failed to combine covariate layers")
  }
  
  # POST-COMBINATION DEBUG
  cat("🔍 POST-COMBINATION DEBUG:\n")
  cat("📊 Combined result layers:", nlyr(combined_result), "\n")
  cat("📊 Combined result names:", paste(names(combined_result), collapse = ", "), "\n")
  
  # Verify terrain layers made it through
  terrain_in_result <- names(combined_result)[grepl("twi|slope|aspect|tri|tpi|elevation", names(combined_result))]
  cat("📊 Terrain layers in final result:", paste(terrain_in_result, collapse = ", "), "\n")
  
  safe_progress("Complete!", 1.0)
  
  n_layers <- tryCatch(nlyr(combined_result), error = function(e) 1)
  layer_names <- tryCatch(names(combined_result), error = function(e) "unknown")
  resolution_val <- tryCatch(round(res(combined_result)[1]), error = function(e) target_resolution)
  
  cat("✅ Production processing complete:", n_layers, "layers\n")
  cat("📅 Date range used:", start_date, "to", end_date, "\n")
  cat("📏 Resolution:", resolution_val, "m\n")
  
  return(combined_result)
}

# =============================================================================
# UTILITY FUNCTIONS (KEPT FROM ORIGINAL)
# =============================================================================

# Cache management functions
clear_cache <- function(pattern = NULL) {
  if (!dir.exists(CACHE_DIR)) return()
  
  if (is.null(pattern)) {
    files_to_remove <- list.files(CACHE_DIR, full.names = TRUE, recursive = TRUE)
  } else {
    files_to_remove <- list.files(CACHE_DIR, pattern = pattern, full.names = TRUE, recursive = TRUE)
  }
  
  if (length(files_to_remove) > 0) {
    file.remove(files_to_remove)
    message(paste("Removed", length(files_to_remove), "cache files"))
  }
}

# Enhanced cache clearing
clear_all_caches <- function() {
  if (dir.exists(CACHE_DIR)) {
    # Clear all caches including session caches
    all_files <- list.files(CACHE_DIR, full.names = TRUE, recursive = TRUE)
    if (length(all_files) > 0) {
      file.remove(all_files)
      cat("🧹 Cleared", length(all_files), "cache files (including sessions)\n")
    }
    
    # Remove empty directories
    all_dirs <- list.dirs(CACHE_DIR, full.names = TRUE, recursive = TRUE)
    all_dirs <- all_dirs[all_dirs != CACHE_DIR]  # Don't remove the main cache dir
    for (dir in all_dirs) {
      try(unlink(dir, recursive = TRUE), silent = TRUE)
    }
  }
}

get_cache_info <- function() {
  if (!dir.exists(CACHE_DIR)) {
    return(data.frame(file = character(0), size_mb = numeric(0), modified = character(0)))
  }
  
  files <- list.files(CACHE_DIR, full.names = TRUE, recursive = TRUE)
  if (length(files) == 0) {
    return(data.frame(file = character(0), size_mb = numeric(0), modified = character(0)))
  }
  
  file_info <- file.info(files)
  cache_info <- data.frame(
    file = basename(files),
    size_mb = round(file_info$size / 1024^2, 2),
    modified = as.character(file_info$mtime),
    stringsAsFactors = FALSE
  )
  
  return(cache_info)
}


# =============================================================================
# DEBUGGING AND TESTING FUNCTIONS
# =============================================================================

#' Debug layer information
#' @param layer_obj SpatRaster object
#' @param layer_name Name of the layer
debug_layer_info <- function(layer_obj, layer_name) {
  tryCatch({
    if (inherits(layer_obj, "SpatRaster")) {
      cat("🔍 Layer:", layer_name, "\n")
      cat("  Type: SpatRaster\n")
      cat("  Layers:", nlyr(layer_obj), "\n")
      cat("  Names:", paste(names(layer_obj), collapse = ", "), "\n")
      cat("  Resolution:", paste(res(layer_obj), collapse = " x "), "\n")
      cat("  Extent:", paste(round(as.vector(ext(layer_obj)), 2), collapse = ", "), "\n")
      cat("  CRS:", as.character(crs(layer_obj)), "\n")
      cat("  Cells:", ncell(layer_obj), "\n")
      cat("  Valid cells:", sum(!is.na(values(layer_obj, row = 1, nrows = 1))), "/", ncol(layer_obj), "\n")
    } else {
      cat("❌ Layer:", layer_name, "- Not a SpatRaster (", class(layer_obj), ")\n")
    }
  }, error = function(e) {
    cat("❌ Layer:", layer_name, "- Error accessing:", e$message, "\n")
  })
}

#' Debug all layers in a list
#' @param layer_list List of SpatRaster objects
debug_all_layers <- function(layer_list, title = "Layer List") {
  cat("\n🔍", title, "Debug Info:\n")
  cat("=", rep("=", nchar(title) + 15), "\n", sep = "")
  
  if (length(layer_list) == 0) {
    cat("⚠️ No layers in list\n")
    return()
  }
  
  for (i in seq_along(layer_list)) {
    layer_name <- names(layer_list)[i]
    if (is.null(layer_name) || layer_name == "") {
      layer_name <- paste0("layer_", i)
    }
    debug_layer_info(layer_list[[i]], layer_name)
    cat("\n")
  }
  
  cat("📊 Summary:", length(layer_list), "total items\n")
  cat("=", rep("=", nchar(title) + 15), "\n\n", sep = "")
}

#' Test layer display readiness
#' @param layer_obj SpatRaster object
#' @param layer_name Name of the layer
test_layer_display <- function(layer_obj, layer_name) {
  cat("\n🧪 TESTING LAYER DISPLAY:", layer_name, "\n")
  cat("=====================================\n")
  
  tryCatch({
    if (!inherits(layer_obj, "SpatRaster")) {
      cat("❌ FAIL: Not a SpatRaster (", class(layer_obj), ")\n")
      return(FALSE)
    }
    
    cat("✅ PASS: Is SpatRaster\n")
    
    # Test basic properties
    n_layers <- nlyr(layer_obj)
    n_cells <- ncell(layer_obj)
    layer_res <- res(layer_obj)
    
    cat("✅ PASS: Basic properties accessible\n")
    cat("  Layers:", n_layers, "\n")
    cat("  Cells:", n_cells, "\n")
    cat("  Resolution:", layer_res[1], "x", layer_res[2], "\n")
    
    # Test values extraction
    test_values <- values(layer_obj, row = 1, nrows = min(10, nrow(layer_obj)))
    if (is.null(test_values) || length(test_values) == 0) {
      cat("❌ FAIL: Cannot extract values\n")
      return(FALSE)
    }
    
    cat("✅ PASS: Values extractable\n")
    
    # Test for valid values
    valid_values <- test_values[!is.na(test_values) & is.finite(test_values)]
    if (length(valid_values) == 0) {
      cat("❌ FAIL: No valid values found\n")
      return(FALSE)
    }
    
    cat("✅ PASS: Has valid values\n")
    cat("  Valid/Total:", length(valid_values), "/", length(test_values), "\n")
    cat("  Range:", round(range(valid_values), 3), "\n")
    
    # Test CRS
    layer_crs <- crs(layer_obj)
    if (is.na(layer_crs) || layer_crs == "") {
      cat("⚠️ WARNING: No CRS defined\n")
    } else {
      cat("✅ PASS: Has CRS:", as.character(layer_crs), "\n")
    }
    
    # Test extent
    layer_ext <- ext(layer_obj)
    ext_values <- as.vector(layer_ext)
    if (any(is.na(ext_values)) || any(!is.finite(ext_values))) {
      cat("❌ FAIL: Invalid extent\n")
      return(FALSE)
    }
    
    cat("✅ PASS: Valid extent:", paste(round(ext_values, 2), collapse = ", "), "\n")
    
    cat("🎉 OVERALL: Layer", layer_name, "is DISPLAY READY!\n")
    cat("=====================================\n\n")
    
    return(TRUE)
    
  }, error = function(e) {
    cat("❌ FAIL: Error testing layer:", e$message, "\n")
    cat("=====================================\n\n")
    return(FALSE)
  })
}

#' Test all layers in covariates
#' @param covariates_list List of covariate layers
test_all_covariates <- function(covariates_list) {
  cat("\n🧪 TESTING ALL COVARIATE LAYERS\n")
  cat("===========================================\n")
  
  if (is.null(covariates_list) || length(covariates_list) == 0) {
    cat("❌ No covariates to test\n")
    return()
  }
  
  results <- list()
  for (layer_name in names(covariates_list)) {
    results[[layer_name]] <- test_layer_display(covariates_list[[layer_name]], layer_name)
  }
  
  # Summary
  cat("📊 SUMMARY:\n")
  passed <- sum(unlist(results))
  total <- length(results)
  cat("  Passed:", passed, "/", total, "layers\n")
  
  if (passed < total) {
    failed_layers <- names(results)[!unlist(results)]
    cat("❌ Failed layers:", paste(failed_layers, collapse = ", "), "\n")
  }
  
  cat("===========================================\n\n")
  
  return(results)
}

#' Quick test a single terrain layer
#' @param lat Latitude
#' @param lon Longitude
quick_test_terrain <- function(lat = 42, lon = -93.5) {
  cat("\n🧪 QUICK TERRAIN TEST\n")
  cat("====================\n")
  
  tryCatch({
    # Test just terrain processing
    result <- download_terrain_production(
      lon = lon,
      lat = lat,
      bbox_size_km = 1,  # Small for speed
      resolution = 30,   # Coarser for speed
      session_id = "test_session"
    )
    
    if (!is.null(result$terrain_raster)) {
      cat("✅ Terrain processing successful\n")
      
      # Test each layer
      for (i in 1:nlyr(result$terrain_raster)) {
        layer_name <- names(result$terrain_raster)[i]
        layer <- result$terrain_raster[[i]]
        
        test_vals <- values(layer, na.rm = TRUE)
        finite_vals <- test_vals[is.finite(test_vals)]
        
        if (length(finite_vals) > 0) {
          cat("  ✅", layer_name, "- Valid (", length(finite_vals), "values, range:",
              round(range(finite_vals), 2), ")\n")
        } else {
          cat("  ❌", layer_name, "- No valid values\n")
        }
      }
    } else {
      cat("❌ Terrain processing failed\n")
    }
    
  }, error = function(e) {
    cat("❌ Test failed:", e$message, "\n")
  })
  
  cat("====================\n\n")
}

#' Force clear all caches and reset
force_reset_app <- function() {
  cat("\n🧹 FORCE RESET APPLICATION\n")
  cat("==========================\n")
  
  # Clear all caches
  if (dir.exists(CACHE_DIR)) {
    all_files <- list.files(CACHE_DIR, full.names = TRUE, recursive = TRUE)
    if (length(all_files) > 0) {
      file.remove(all_files)
      cat("✅ Removed", length(all_files), "cache files\n")
    }
    
    # Remove all session directories
    session_dirs <- list.dirs(file.path(CACHE_DIR, "sessions"), full.names = TRUE, recursive = FALSE)
    if (length(session_dirs) > 0) {
      unlink(session_dirs, recursive = TRUE)
      cat("✅ Removed", length(session_dirs), "session directories\n")
    }
  }
  
  # Clear temp files
  if (dir.exists(TEMP_DIR)) {
    temp_files <- list.files(TEMP_DIR, full.names = TRUE, recursive = TRUE)
    if (length(temp_files) > 0) {
      file.remove(temp_files)
      cat("✅ Removed", length(temp_files), "temp files\n")
    }
  }
  
  cat("🚀 Application reset complete - restart your app\n")
  cat("==========================\n\n")
}


# =============================================================================
# SOIL DATA PROCESSING (KEPT UNCHANGED FOR COMPATIBILITY)
# =============================================================================

# get_soil_data_bbox <- function(lat, lon, bbox_size_km,
#                                target_resolution = 30,
#                                progress = NULL) {
#
#   cat("🌱 Starting bbox-centered soil data processing...\n")
#   cat("📍 Center point:", lat, ",", lon, "\n")
#   cat("📏 Bbox size:", bbox_size_km, "km\n")
#
#   if (is.function(progress)) progress(detail = "Initializing soil data processing...", value = 0.1)
#
#   # Validate inputs
#   if (!is.numeric(lat) || !is.numeric(lon) || abs(lat) > 90 || abs(lon) > 180) {
#     stop("Invalid coordinates: lat must be [-90,90], lon [-180,180]")
#   }
#
#   if (bbox_size_km <= 0 || bbox_size_km > 100) {
#     stop("bbox_size_km must be between 0 and 100 km")
#   }
#
#
#   # Calculate UTM zone for the center point
#   utm_zone <- floor((lon + 180) / 6) + 1
#   target_crs <- ifelse(lat >= 0, 32600 + utm_zone, 32700 + utm_zone)
#
#   cat("📍 Using UTM CRS:", target_crs, "\n")
#
#   # Create center point and transform to UTM
#   center_wgs <- st_sfc(st_point(c(lon, lat)), crs = 4326)
#   center_utm <- st_transform(center_wgs, target_crs)
#   center_coords <- st_coordinates(center_utm)
#
#   # Create bbox in UTM coordinates
#   bbox_radius_m <- (bbox_size_km * 1000) / 2
#   bbox_utm <- c(
#     xmin = center_coords[1] - bbox_radius_m,
#     ymin = center_coords[2] - bbox_radius_m,
#     xmax = center_coords[1] + bbox_radius_m,
#     ymax = center_coords[2] + bbox_radius_m
#   )
#
#   # Create AOI polygon from bbox
#   aoi_utm <- st_polygon(list(rbind(
#     c(bbox_utm[1], bbox_utm[2]),  # bottom-left
#     c(bbox_utm[3], bbox_utm[2]),  # bottom-right
#     c(bbox_utm[3], bbox_utm[4]),  # top-right
#     c(bbox_utm[1], bbox_utm[4]),  # top-left
#     c(bbox_utm[1], bbox_utm[2])   # close polygon
#   )))
#
#   aoi_sf <- st_sfc(aoi_utm, crs = target_crs)
#   aoi_wgs84 <- st_transform(aoi_sf, 4326)
#
#   # Create cache key
#   bbox_str <- paste(round(c(lat, lon, bbox_size_km), 6), collapse = "_")
#   cache_key <- paste("soil_bbox", bbox_str, target_resolution, sep = "_")
#   cache_file <- file.path(CACHE_DIR, paste0(cache_key, ".tif"))
#
#   # Check cache
#   if (file.exists(cache_file)) {
#     cat("📦 Loading soil data from cache...\n")
#     return(rast(cache_file))
#   }
#
#   if (is.function(progress)) progress(detail = "Downloading SSURGO soil data...", value = 0.3)
#
#   cat("🌍 Downloading soil data from SSURGO...\n")
#
#   tryCatch({
#     # Get SSURGO data using the AOI
#     ssurgo_data <- get_ssurgo(template = aoi_wgs84,
#                               label = "soilstrata_soil",
#                               extraction.dir = TEMP_DIR)
#
#     if (is.function(progress)) progress(detail = "Processing soil survey data...", value = 0.6)
#
#     # Extract relevant soil properties
#     # Convert spatial data to raster format
#     soil_raster <- rast(ssurgo_data$spatial)
#
#     # Transform to target CRS if needed
#     if (crs(soil_raster) != paste0("EPSG:", target_crs)) {
#       soil_raster <- project(soil_raster, paste0("EPSG:", target_crs))
#     }
#
#     # Create template raster with desired resolution
#     template <- rast(ext(bbox_utm), resolution = target_resolution, crs = paste0("EPSG:", target_crs))
#
#     # Resample soil data to target resolution
#     soil_resampled <- resample(soil_raster, template, method = "near")
#
#     if (is.function(progress)) progress(detail = "Extracting soil properties...", value = 0.8)
#
#     # Process soil properties from SSURGO tables
#     # Note: This is a simplified approach. In practice, you would:
#     # 1. Join spatial data with soil property tables using MUKEY
#     # 2. Extract specific properties like clay content, sand content, etc.
#     # 3. Handle multiple soil components per map unit
#
#     # For demonstration, create clay content based on available data
#     # In a full implementation, you'd extract from soils tables:
#     # clay_content <- extract_soil_property(ssurgo_data$tabular, "claytotal_r")
#
#     # Simplified approach - use map unit key as basis for soil properties
#     clay_content <- soil_resampled
#
#     # Create realistic clay content values based on soil map units
#     # This would normally come from joining with component/horizon tables
#     map_unit_values <- values(soil_resampled)
#     unique_units <- unique(map_unit_values[!is.na(map_unit_values)])
#
#     # Assign clay percentages to each map unit (simplified)
#     clay_lookup <- setNames(
#       sample(seq(5, 45, by = 5), length(unique_units), replace = TRUE),
#       unique_units
#     )
#
#     # Apply lookup to create clay content raster
#     clay_values <- clay_lookup[as.character(map_unit_values)]
#     values(clay_content) <- clay_values
#     names(clay_content) <- "clay_percent"
#
#     # Mask to exact bbox
#     aoi_utm_sf <- st_sf(geometry = aoi_sf)
#     aoi_vect <- vect(aoi_utm_sf)
#     clay_masked <- mask(clay_content, aoi_vect)
#
#     if (is.function(progress)) progress(detail = "Caching soil data...", value = 0.9)
#
#     # Cache the result
#     writeRaster(clay_masked, cache_file, overwrite = TRUE)
#
#     if (is.function(progress)) progress(detail = "Soil processing complete!", value = 1.0)
#
#     cat("✅ Soil data processed successfully\n")
#     cat("📏 Final resolution:", res(clay_masked)[1], "meters\n")
#     cat("📊 Clay content range:", round(minmax(clay_masked)[1], 1), "-",
#         round(minmax(clay_masked)[2], 1), "%\n")
#
#     return(clay_masked)
#
#   }, error = function(e) {
#     cat("❌ Soil data processing failed:", e$message, "\n")
#     stop("Failed to process soil data: ", e$message)
#   })
# }

# =============================================================================
# INITIALIZATION
# =============================================================================

# Print production status
cat("🚀 SoilStrata Data Processing Module - Production Version Loaded\n")
cat("📍 Features: Session isolation, fast caching, optimized layer combination\n")
cat("🎯 Optimized for: Multi-user Shiny applications with concurrent access\n")