import type { Locale } from "@/lib/site-content"

export type AdminProductLocale = Locale

type ProductAdminCopy = {
  management: {
    eyebrow: string
    title: string
    description: string
    newProduct: string
    table: {
      name: string
      category: string
      status: string
      price: string
      cost: string
      stock: string
      minStock: string
      actions: string
      empty: string
    }
    statuses: {
      ready: string
      review: string
      low: string
      out: string
    }
    actions: {
      edit: string
      delete: string
      open: string
    }
    confirmDelete: string
    deleted: string
    drawerTitleCreate: string
    drawerTitleEdit: string
    drawerDescription: string
  }
  edit: {
    eyebrow: string
    title: string
    back: string
    stockLabel: string
    formTitle: string
    addressTitle: string
    addressDescription: string
    historyTitle: string
    historyEmpty: string
    historyColumns: {
      date: string
      reason: string
      change: string
      balance: string
    }
  }
  form: {
    validation: {
      name: string
      category: string
      subcategory: string
      price: string
      cost: string
      weightKg: string
      lengthCm: string
      widthCm: string
      heightCm: string
      imageUrl: string
      stock: string
      minStock: string
      amountZero: string
    }
    labels: {
      name: string
      category: string
      subcategory: string
      imageUrl: string
      price: string
      cost: string
      stock: string
      minStock: string
      weightKg: string
      lengthCm: string
      widthCm: string
      heightCm: string
      shippingSection: string
      shippingHelp: string
      volumetricWeight: string
      volumetricWarning: string
      stockAdjustmentTitle: string
      stockAdjustmentDescription: string
      adjustmentAmount: string
      adjustmentReason: string
      applyAdjustment: string
    }
    options: {
      restock: string
      damaged: string
      expired: string
      sold: string
      manualAdjustment: string
    }
    actions: {
      create: string
      update: string
      cancel: string
    }
    toasts: {
      created: string
      updated: string
      adjusted: string
      shippingPreviewTitle: string
      shippingPreviewDescription: string
    }
  }
    preview: {
      title: string
      subtitle: string
      stepRates: string
      stepConfirm: string
      customer: string
      email: string
      phone: string
      address: string
      method: string
    cost: string
    cart: string
    photos: string
      totalWeight: string
      billableWeight: string
      weightCardTitle: string
      totalsCardTitle: string
      saleTotal: string
      taxes: string
      netSales: string
      shippingCost: string
      continue: string
      back: string
      confirm: string
      cancel: string
      close: string
      confirmDialogTitle: string
      confirmDialogDescription: string
      confirmDialogCustomer: string
      confirmDialogAddress: string
      confirmDialogMethod: string
      confirmDialogTotals: string
      confirmDialogWeight: string
      confirmDialogItems: string
      confirmDialogCancel: string
      confirmDialogAction: string
      loading: string
      error: string
      retry: string
      confirmed: string
    countryLabelMX: string
    countryLabelCA: string
  }
}

const productCopy: Record<AdminProductLocale, ProductAdminCopy> = {
  en: {
    management: {
      eyebrow: "Admin products",
      title: "Product management",
      description: "Functional catalog control for the store owner. Products are written directly to Neon through the admin API.",
      newProduct: "New Product",
      table: {
        name: "Name",
        category: "Category",
        status: "Status",
        price: "Price",
        cost: "Cost",
        stock: "Stock",
        minStock: "Min stock",
        actions: "Actions",
        empty: "No products yet.",
      },
      statuses: {
        ready: "Ready",
        review: "In review",
        low: "Low stock",
        out: "Out of stock",
      },
      actions: {
        edit: "Edit",
        delete: "Delete",
        open: "Open",
      },
      confirmDelete: "Delete this product? This will soft-delete it.",
      deleted: "Product deleted",
      drawerTitleCreate: "New product",
      drawerTitleEdit: "Edit product",
      drawerDescription: "Product data is stored directly in Neon.",
    },
    edit: {
      eyebrow: "Admin products",
      title: "Edit product",
      back: "Back to list",
      stockLabel: "Stock",
      formTitle: "Product form",
      addressTitle: "Mock shipping address",
      addressDescription: "Preview the destination data that will be shown in shipping and fulfillment flows.",
      historyTitle: "Stock history",
      historyEmpty: "No stock history yet.",
      historyColumns: {
        date: "Date",
        reason: "Reason",
        change: "Change",
        balance: "Balance",
      },
    },
    form: {
      validation: {
        name: "The name is required",
        category: "The category is required",
        subcategory: "The subcategory is required",
        price: "Price cannot be negative",
        cost: "Cost cannot be negative",
        weightKg: "Weight is required",
        lengthCm: "Length is required",
        widthCm: "Width is required",
        heightCm: "Height is required",
        imageUrl: "Enter a valid URL",
        stock: "Stock cannot be negative",
        minStock: "Minimum stock cannot be negative",
        amountZero: "The amount cannot be zero",
      },
      labels: {
        name: "Name",
        category: "Category",
        subcategory: "Subcategory",
        imageUrl: "Image URL",
        price: "Price",
        cost: "Cost",
        stock: "Stock",
        minStock: "Min stock",
        weightKg: "Weight (kg)",
        lengthCm: "Length (cm)",
        widthCm: "Width (cm)",
        heightCm: "Height (cm)",
        shippingSection: "Shipping dimensions",
        shippingHelp: "Measure the packed parcel, not the product alone",
        volumetricWeight: "Volumetric weight",
        volumetricWarning: "The carrier will charge volumetric weight because it is higher",
        stockAdjustmentTitle: "Stock adjustment",
        stockAdjustmentDescription: "Positive amounts restock. Negative amounts consume stock.",
        adjustmentAmount: "Adjustment amount",
        adjustmentReason: "Reason",
        applyAdjustment: "Apply",
      },
      options: {
        restock: "restock",
        damaged: "damaged",
        expired: "expired",
        sold: "sold",
        manualAdjustment: "manual-adjustment",
      },
      actions: {
        create: "Create product",
        update: "Save changes",
        cancel: "Cancel",
      },
      toasts: {
        created: "Product created",
        updated: "Product updated",
        adjusted: "Inventory updated",
        shippingPreviewTitle: "Shipping preview",
        shippingPreviewDescription: "Open the mocked shipping quote flow for this product.",
      },
    },
    preview: {
      title: "Shipping preview",
      subtitle: "Mocked carrier options and a checkout-style confirmation for the saved product.",
      stepRates: "Shipping options",
      stepConfirm: "Confirm shipment",
      customer: "Customer",
      email: "Email",
      phone: "Phone",
      address: "Shipping address",
      method: "Shipping method",
      cost: "Shipping cost",
      cart: "Cart items",
      photos: "Product photos",
      totalWeight: "Total weight",
      billableWeight: "Billable weight",
      weightCardTitle: "Shipment weight",
      totalsCardTitle: "Totals",
      saleTotal: "Sale total",
      taxes: "Taxes",
      netSales: "Net sales",
      shippingCost: "Shipping",
      continue: "Continue",
      back: "Back",
      confirm: "Confirm shipping",
      cancel: "Cancel",
      close: "Close",
      confirmDialogTitle: "Confirm shipping details",
      confirmDialogDescription: "Review the shipment summary before marking this product as ready to send.",
      confirmDialogCustomer: "Customer",
      confirmDialogAddress: "Address",
      confirmDialogMethod: "Carrier",
      confirmDialogTotals: "Totals",
      confirmDialogWeight: "Weight",
      confirmDialogItems: "Items",
      confirmDialogCancel: "Go back",
      confirmDialogAction: "Yes, confirm",
      loading: "Loading shipping options...",
      error: "We couldn't load the shipping preview.",
      retry: "Retry",
      confirmed: "Shipping preview confirmed",
      countryLabelMX: "🇲🇽 Mexico",
      countryLabelCA: "🇨🇦 Canada",
    },
  },
  es: {
    management: {
      eyebrow: "Productos admin",
      title: "Gestión de productos",
      description: "Control funcional del catálogo para el dueño de la tienda. Los productos se escriben directo en Neon vía la API de admin.",
      newProduct: "Nuevo producto",
      table: {
        name: "Nombre",
        category: "Categoría",
        status: "Estado",
        price: "Precio",
        cost: "Costo",
        stock: "Stock",
        minStock: "Stock mín.",
        actions: "Acciones",
        empty: "Aún no hay productos.",
      },
      statuses: {
        ready: "Listo",
        review: "En revisión",
        low: "Stock bajo",
        out: "Sin stock",
      },
      actions: {
        edit: "Editar",
        delete: "Eliminar",
        open: "Abrir",
      },
      confirmDelete: "¿Eliminar este producto? Se borrará de forma lógica.",
      deleted: "Producto eliminado",
      drawerTitleCreate: "Nuevo producto",
      drawerTitleEdit: "Editar producto",
      drawerDescription: "Los datos del producto se guardan directamente en Neon.",
    },
    edit: {
      eyebrow: "Productos admin",
      title: "Editar producto",
      back: "Volver a la lista",
      stockLabel: "Stock",
      formTitle: "Formulario de producto",
      addressTitle: "Dirección mock de envío",
      addressDescription: "Vista previa de la dirección que se usa en los flujos de envío y fulfillment.",
      historyTitle: "Historial de stock",
      historyEmpty: "Todavía no hay historial de stock.",
      historyColumns: {
        date: "Fecha",
        reason: "Motivo",
        change: "Cambio",
        balance: "Saldo",
      },
    },
    form: {
      validation: {
        name: "El nombre es obligatorio",
        category: "La categoría es obligatoria",
        subcategory: "La subcategoría es obligatoria",
        price: "El precio no puede ser negativo",
        cost: "El costo no puede ser negativo",
        weightKg: "El peso es obligatorio",
        lengthCm: "El largo es obligatorio",
        widthCm: "El ancho es obligatorio",
        heightCm: "El alto es obligatorio",
        imageUrl: "Ingresa una URL válida",
        stock: "El stock no puede ser negativo",
        minStock: "El stock mínimo no puede ser negativo",
        amountZero: "La cantidad no puede ser cero",
      },
      labels: {
        name: "Nombre",
        category: "Categoría",
        subcategory: "Subcategoría",
        imageUrl: "URL de imagen",
        price: "Precio",
        cost: "Costo",
        stock: "Stock",
        minStock: "Stock mín.",
        weightKg: "Peso (kg)",
        lengthCm: "Largo (cm)",
        widthCm: "Ancho (cm)",
        heightCm: "Alto (cm)",
        shippingSection: "Dimensiones de envío",
        shippingHelp: "Mide el paquete ya empacado, no el producto solo",
        volumetricWeight: "Peso volumétrico",
        volumetricWarning: "La paquetería cobrará el peso volumétrico por ser mayor",
        stockAdjustmentTitle: "Ajuste de inventario",
        stockAdjustmentDescription: "Las cantidades positivas reabastecen. Las negativas consumen stock.",
        adjustmentAmount: "Cantidad del ajuste",
        adjustmentReason: "Motivo",
        applyAdjustment: "Aplicar",
      },
      options: {
        restock: "reabastecer",
        damaged: "dañado",
        expired: "vencido",
        sold: "vendido",
        manualAdjustment: "ajuste-manual",
      },
      actions: {
        create: "Crear producto",
        update: "Guardar cambios",
        cancel: "Cancelar",
      },
      toasts: {
        created: "Producto creado",
        updated: "Producto actualizado",
        adjusted: "Inventario actualizado",
        shippingPreviewTitle: "Vista previa de envío",
        shippingPreviewDescription: "Abre el flujo simulado de cotización de envío para este producto.",
      },
    },
    preview: {
      title: "Vista previa de envío",
      subtitle: "Opciones simuladas de paquetería y una confirmación estilo checkout para el producto guardado.",
      stepRates: "Opciones de envío",
      stepConfirm: "Confirmar envío",
      customer: "Cliente",
      email: "Correo",
      phone: "Teléfono",
      address: "Dirección de envío",
      method: "Método de envío",
      cost: "Costo de envío",
      cart: "Artículos del carrito",
      photos: "Fotos de productos",
      totalWeight: "Peso total",
      billableWeight: "Peso facturable",
      weightCardTitle: "Peso del envío",
      totalsCardTitle: "Totales",
      saleTotal: "Total de la venta",
      taxes: "IVA / taxes",
      netSales: "Ventas netas",
      shippingCost: "Envío",
      continue: "Continuar",
      back: "Volver",
      confirm: "Confirmar envío",
      cancel: "Cancelar",
      close: "Cerrar",
      confirmDialogTitle: "Confirmar detalles del envío",
      confirmDialogDescription: "Revisa el resumen del envío antes de marcar este producto como listo para salir.",
      confirmDialogCustomer: "Cliente",
      confirmDialogAddress: "Dirección",
      confirmDialogMethod: "Paquetería",
      confirmDialogTotals: "Totales",
      confirmDialogWeight: "Peso",
      confirmDialogItems: "Artículos",
      confirmDialogCancel: "Volver",
      confirmDialogAction: "Sí, confirmar",
      loading: "Cargando opciones de envío...",
      error: "No pudimos cargar la vista previa de envío.",
      retry: "Reintentar",
      confirmed: "Vista previa de envío confirmada",
      countryLabelMX: "🇲🇽 México",
      countryLabelCA: "🇨🇦 Canadá",
    },
  },
  fr: {
    management: {
      eyebrow: "Produits admin",
      title: "Gestion des produits",
      description: "Contrôle fonctionnel du catalogue pour le propriétaire de la boutique. Les produits sont écrits directement dans Neon via l’API admin.",
      newProduct: "Nouveau produit",
      table: {
        name: "Nom",
        category: "Catégorie",
        status: "Statut",
        price: "Prix",
        cost: "Coût",
        stock: "Stock",
        minStock: "Stock min.",
        actions: "Actions",
        empty: "Aucun produit pour le moment.",
      },
      statuses: {
        ready: "Prêt",
        review: "En révision",
        low: "Stock faible",
        out: "Rupture de stock",
      },
      actions: {
        edit: "Modifier",
        delete: "Supprimer",
        open: "Ouvrir",
      },
      confirmDelete: "Supprimer ce produit ? Il sera masqué de façon logique.",
      deleted: "Produit supprimé",
      drawerTitleCreate: "Nouveau produit",
      drawerTitleEdit: "Modifier le produit",
      drawerDescription: "Les données produit sont enregistrées directement dans Neon.",
    },
    edit: {
      eyebrow: "Produits admin",
      title: "Modifier le produit",
      back: "Retour à la liste",
      stockLabel: "Stock",
      formTitle: "Formulaire produit",
      addressTitle: "Adresse mock d’expédition",
      addressDescription: "Aperçu des données de destination utilisées dans les flux d’expédition et de fulfillment.",
      historyTitle: "Historique du stock",
      historyEmpty: "Aucun historique de stock pour le moment.",
      historyColumns: {
        date: "Date",
        reason: "Raison",
        change: "Variation",
        balance: "Solde",
      },
    },
    form: {
      validation: {
        name: "Le nom est obligatoire",
        category: "La catégorie est obligatoire",
        subcategory: "La sous-catégorie est obligatoire",
        price: "Le prix ne peut pas être négatif",
        cost: "Le coût ne peut pas être négatif",
        weightKg: "Le poids est obligatoire",
        lengthCm: "La longueur est obligatoire",
        widthCm: "La largeur est obligatoire",
        heightCm: "La hauteur est obligatoire",
        imageUrl: "Saisissez une URL valide",
        stock: "Le stock ne peut pas être négatif",
        minStock: "Le stock minimum ne peut pas être négatif",
        amountZero: "La quantité ne peut pas être nulle",
      },
      labels: {
        name: "Nom",
        category: "Catégorie",
        subcategory: "Sous-catégorie",
        imageUrl: "URL de l’image",
        price: "Prix",
        cost: "Coût",
        stock: "Stock",
        minStock: "Stock min.",
        weightKg: "Poids (kg)",
        lengthCm: "Longueur (cm)",
        widthCm: "Largeur (cm)",
        heightCm: "Hauteur (cm)",
        shippingSection: "Dimensions d’expédition",
        shippingHelp: "Mesurez le colis déjà emballé, pas le produit seul",
        volumetricWeight: "Poids volumétrique",
        volumetricWarning: "Le transporteur facturera le poids volumétrique car il est plus élevé",
        stockAdjustmentTitle: "Ajustement de stock",
        stockAdjustmentDescription: "Les montants positifs réapprovisionnent. Les négatifs consomment du stock.",
        adjustmentAmount: "Montant de l’ajustement",
        adjustmentReason: "Raison",
        applyAdjustment: "Appliquer",
      },
      options: {
        restock: "réapprovisionner",
        damaged: "endommagé",
        expired: "expiré",
        sold: "vendu",
        manualAdjustment: "ajustement-manuel",
      },
      actions: {
        create: "Créer le produit",
        update: "Enregistrer les modifications",
        cancel: "Annuler",
      },
      toasts: {
        created: "Produit créé",
        updated: "Produit mis à jour",
        adjusted: "Stock mis à jour",
        shippingPreviewTitle: "Aperçu d’expédition",
        shippingPreviewDescription: "Ouvre le flux simulé de devis d’expédition pour ce produit.",
      },
    },
    preview: {
      title: "Aperçu d’expédition",
      subtitle: "Options de transport simulées et une confirmation de type checkout pour le produit enregistré.",
      stepRates: "Options d’expédition",
      stepConfirm: "Confirmer l’expédition",
      customer: "Client",
      email: "E-mail",
      phone: "Téléphone",
      address: "Adresse d’expédition",
      method: "Mode d’expédition",
      cost: "Coût d’expédition",
      cart: "Articles du panier",
      photos: "Photos des produits",
      totalWeight: "Poids total",
      billableWeight: "Poids facturable",
      weightCardTitle: "Poids de l’envoi",
      totalsCardTitle: "Totaux",
      saleTotal: "Total de la vente",
      taxes: "Taxes",
      netSales: "Ventes nettes",
      shippingCost: "Expédition",
      continue: "Continuer",
      back: "Retour",
      confirm: "Confirmer l’expédition",
      cancel: "Annuler",
      close: "Fermer",
      confirmDialogTitle: "Confirmer les détails d’expédition",
      confirmDialogDescription: "Vérifiez le résumé de l’envoi avant de marquer ce produit comme prêt à expédier.",
      confirmDialogCustomer: "Client",
      confirmDialogAddress: "Adresse",
      confirmDialogMethod: "Transporteur",
      confirmDialogTotals: "Totaux",
      confirmDialogWeight: "Poids",
      confirmDialogItems: "Articles",
      confirmDialogCancel: "Retour",
      confirmDialogAction: "Oui, confirmer",
      loading: "Chargement des options d’expédition...",
      error: "Impossible de charger l’aperçu d’expédition.",
      retry: "Réessayer",
      confirmed: "Aperçu d’expédition confirmé",
      countryLabelMX: "🇲🇽 Mexique",
      countryLabelCA: "🇨🇦 Canada",
    },
  },
}

export function getProductAdminCopy(locale: AdminProductLocale = "en") {
  return productCopy[locale] ?? productCopy.en
}
