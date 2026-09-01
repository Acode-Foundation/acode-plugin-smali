.class public final Lcom/example/SmaliCompatibilitySample;
.super Ljava/lang/Object;
.source "SmaliCompatibilitySample.java"

# A realistic large-file fixture shared by automated and device validation.
.annotation runtime Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/example/SmaliCompatibilitySample$Worker;
    }
.end annotation

.field private static final DEFAULT_MESSAGE:Ljava/lang/String; = "Smali compatibility"
.field private static final VALUES:[I
.field private count:I
.field private message:Ljava/lang/String;

.method static constructor <clinit>()V
    .locals 1
    const/4 v0, 0x5
    new-array v0, v0, [I
    fill-array-data v0, :initial_values
    sput-object v0, Lcom/example/SmaliCompatibilitySample;->VALUES:[I
    return-void

    :initial_values
    .array-data 4
        0x1
        0x2
        0x3
        0x5
        0x8
    .end array-data
.end method

.method public constructor <init>()V
    .locals 1
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    const/4 v0, 0x0
    iput v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    const-string v0, "ready"
    iput-object v0, p0, Lcom/example/SmaliCompatibilitySample;->message:Ljava/lang/String;
    return-void
.end method

.method public getMessage()Ljava/lang/String;
    .locals 1
    iget-object v0, p0, Lcom/example/SmaliCompatibilitySample;->message:Ljava/lang/String;
    return-object v0
.end method

.method public setMessage(Ljava/lang/String;)V
    .locals 0
    iput-object p1, p0, Lcom/example/SmaliCompatibilitySample;->message:Ljava/lang/String;
    return-void
.end method

.method private process01(I)I
    .locals 4
    .line 101
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_01
    const-string v3, "worker 01"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_01

    :fallback_01
    const/4 v2, 0x0

    :done_01
    return v2
.end method

.method private process02(I)I
    .locals 4
    .line 102
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_02
    const-string v3, "worker 02"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_02

    :fallback_02
    const/4 v2, 0x0

    :done_02
    return v2
.end method

.method private process03(I)I
    .locals 4
    .line 103
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_03
    const-string v3, "worker 03"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_03

    :fallback_03
    const/4 v2, 0x0

    :done_03
    return v2
.end method

.method private process04(I)I
    .locals 4
    .line 104
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_04
    const-string v3, "worker 04"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_04

    :fallback_04
    const/4 v2, 0x0

    :done_04
    return v2
.end method

.method private process05(I)I
    .locals 4
    .line 105
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_05
    const-string v3, "worker 05"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_05

    :fallback_05
    const/4 v2, 0x0

    :done_05
    return v2
.end method

.method private process06(I)I
    .locals 4
    .line 106
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_06
    const-string v3, "worker 06"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_06

    :fallback_06
    const/4 v2, 0x0

    :done_06
    return v2
.end method

.method private process07(I)I
    .locals 4
    .line 107
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_07
    const-string v3, "worker 07"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_07

    :fallback_07
    const/4 v2, 0x0

    :done_07
    return v2
.end method

.method private process08(I)I
    .locals 4
    .line 108
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_08
    const-string v3, "worker 08"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_08

    :fallback_08
    const/4 v2, 0x0

    :done_08
    return v2
.end method

.method private process09(I)I
    .locals 4
    .line 109
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_09
    const-string v3, "worker 09"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_09

    :fallback_09
    const/4 v2, 0x0

    :done_09
    return v2
.end method

.method private process10(I)I
    .locals 4
    .line 110
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_10
    const-string v3, "worker 10"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_10

    :fallback_10
    const/4 v2, 0x0

    :done_10
    return v2
.end method

.method private process11(I)I
    .locals 4
    .line 111
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_11
    const-string v3, "worker 11"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_11

    :fallback_11
    const/4 v2, 0x0

    :done_11
    return v2
.end method

.method private process12(I)I
    .locals 4
    .line 112
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_12
    const-string v3, "worker 12"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_12

    :fallback_12
    const/4 v2, 0x0

    :done_12
    return v2
.end method

.method private process13(I)I
    .locals 4
    .line 113
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_13
    const-string v3, "worker 13"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_13

    :fallback_13
    const/4 v2, 0x0

    :done_13
    return v2
.end method

.method private process14(I)I
    .locals 4
    .line 114
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_14
    const-string v3, "worker 14"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_14

    :fallback_14
    const/4 v2, 0x0

    :done_14
    return v2
.end method

.method private process15(I)I
    .locals 4
    .line 115
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    add-int v1, v0, p1
    mul-int/lit8 v2, v1, 0x2
    if-lez v2, :fallback_15
    const-string v3, "worker 15"
    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;
    move-result-object v3
    iput v2, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    goto :done_15

    :fallback_15
    const/4 v2, 0x0

    :done_15
    return v2
.end method

.method public runWorkers(I)I
    .locals 3
    const/4 v0, 0x0
    const/4 v1, 0x0

    :worker_loop
    if-ge v1, p1, :worker_done
    invoke-direct {p0, v1}, Lcom/example/SmaliCompatibilitySample;->process01(I)I
    move-result v2
    add-int/2addr v0, v2
    add-int/lit8 v1, v1, 0x1
    goto :worker_loop

    :worker_done
    return v0
.end method

.method public describe(I)Ljava/lang/String;
    .locals 1
    packed-switch p1, :packed_cases
    const-string v0, "unknown"
    return-object v0

    :case_zero
    const-string v0, "zero"
    return-object v0

    :case_one
    const-string v0, "one\nline"
    return-object v0

    :case_two
    const-string v0, "two"
    return-object v0

    :packed_cases
    .packed-switch 0x0
        :case_zero
        :case_one
        :case_two
    .end packed-switch
.end method

.method public sparseDescribe(I)Ljava/lang/String;
    .locals 1
    sparse-switch p1, :sparse_cases
    const-string v0, "other"
    return-object v0

    :negative
    const-string v0, "negative"
    return-object v0

    :large
    const-string v0, "large"
    return-object v0

    :sparse_cases
    .sparse-switch
        -0x1 -> :negative
        0x3e8 -> :large
    .end sparse-switch
.end method

.method public safeLength(Ljava/lang/String;)I
    .locals 2
    :try_start
    invoke-virtual {p1}, Ljava/lang/String;->length()I
    move-result v0
    :try_end
    return v0

    :catch_null
    move-exception v1
    const/4 v0, -0x1
    return v0

    .catch Ljava/lang/NullPointerException; {:try_start .. :try_end} :catch_null
.end method

.method public synchronized updateCount(J)J
    .locals 4
    monitor-enter p0
    :try_monitor
    iget v0, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    int-to-long v1, v0
    add-long/2addr v1, p1
    long-to-int v3, v1
    iput v3, p0, Lcom/example/SmaliCompatibilitySample;->count:I
    monitor-exit p0
    return-wide v1

    :catch_monitor
    move-exception v0
    monitor-exit p0
    throw v0

    .catchall {:try_monitor .. :catch_monitor} :catch_monitor
.end method

.method public createMatrix(II)[[I
    .locals 2
    filled-new-array {p1, p2}, [I
    move-result-object v0
    const-class v1, [I
    invoke-static {v1, v0}, Ljava/lang/reflect/Array;->newInstance(Ljava/lang/Class;[I)Ljava/lang/Object;
    move-result-object v0
    check-cast v0, [[I
    return-object v0
.end method

.method public compare(DD)I
    .locals 1
    cmpg-double v0, p1, p3
    return v0
.end method

.method public readValue(I)I
    .locals 2
    sget-object v0, Lcom/example/SmaliCompatibilitySample;->VALUES:[I
    aget v1, v0, p1
    return v1
.end method

.method public writeValue(II)V
    .locals 1
    sget-object v0, Lcom/example/SmaliCompatibilitySample;->VALUES:[I
    aput p2, v0, p1
    return-void
.end method
# End-to-end compatibility checkpoint 1
# End-to-end compatibility checkpoint 2
# End-to-end compatibility checkpoint 3
# End-to-end compatibility checkpoint 4
# End-to-end compatibility checkpoint 5
# End-to-end compatibility checkpoint 6
# End-to-end compatibility checkpoint 7
# End-to-end compatibility checkpoint 8
# End-to-end compatibility checkpoint 9
# End-to-end compatibility checkpoint 10
# End-to-end compatibility checkpoint 11
# End-to-end compatibility checkpoint 12
# End-to-end compatibility checkpoint 13
# End-to-end compatibility checkpoint 14
